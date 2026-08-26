import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDirectory = fileURLToPath(new URL("..", import.meta.url));
const publicDirectory = join(rootDirectory, "public");
const dataDirectory = join(publicDirectory, "data");
const imagesDirectory = join(publicDirectory, "backup-images");
const temporaryImagesDirectory = join(publicDirectory, ".backup-images-next");
const backupPath = join(dataDirectory, "catalog-backup.json");
const bundledRealImages = new Set([
  "toboga-real.jpeg",
  "pula-pula-real.jpeg",
  "piscina-bolinhas-real.jpeg",
  "mesas-cadeiras-real.jpeg",
  "sinuca-real.jpeg",
  "pebolim-real.jpeg",
  "aero-hockey-real.jpeg",
  "evento-com-criancas.jpeg",
  "montagem-completa-real.jpeg",
  "recreacao-real.jpeg",
  "carrinho-guloseimas-real.jpeg",
  "pintura-facial-real.jpeg",
]);

async function readEnvironmentFile() {
  try {
    const raw = await readFile(join(rootDirectory, ".env"), "utf8");
    return Object.fromEntries(
      raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const separator = line.indexOf("=");
          return [line.slice(0, separator), line.slice(separator + 1)];
        }),
    );
  } catch {
    return {};
  }
}

function getPublicImageUrl(supabaseUrl, imagePath) {
  return `${supabaseUrl}/storage/v1/object/public/catalog/${imagePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

function getLocalImageName(imagePath) {
  const extension = extname(imagePath) || ".jpg";
  const hash = createHash("sha256").update(imagePath).digest("hex").slice(0, 16);
  return `${hash}${extension.toLowerCase()}`;
}

function getBundledImagePath(imagePath) {
  const filename = imagePath?.split("/").pop();
  if (!filename) return "";
  return bundledRealImages.has(filename)
    ? `/images/real/${filename}`
    : ["algodao-doce.png", "arco-baloes.png"].includes(filename)
      ? `/images/${filename}`
      : "";
}

async function mirrorImage(supabaseUrl, imagePath, destinationDirectory) {
  if (!imagePath) return "";

  try {
    const response = await fetch(getPublicImageUrl(supabaseUrl, imagePath));
    if (!response.ok) return getBundledImagePath(imagePath);

    const localName = getLocalImageName(imagePath);
    await writeFile(
      join(destinationDirectory, localName),
      Buffer.from(await response.arrayBuffer()),
    );
    return `/backup-images/${localName}`;
  } catch {
    return getBundledImagePath(imagePath);
  }
}

async function fetchRows(supabaseUrl, anonKey, table, columns, order) {
  const endpoint = new URL(`/rest/v1/${table}`, supabaseUrl);
  endpoint.searchParams.set("select", columns);
  endpoint.searchParams.set("active", "eq.true");
  endpoint.searchParams.set("order", order);

  const response = await fetch(endpoint, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });

  if (!response.ok) {
    throw new Error(`${table} indisponível (${response.status})`);
  }

  return response.json();
}

async function buildBackup() {
  const fileEnvironment = await readEnvironmentFile();
  const supabaseUrl = (process.env.VITE_SUPABASE_URL || fileEnvironment.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || fileEnvironment.VITE_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !anonKey) {
    console.warn("[catalog-backup] Supabase não configurado. O backup existente será preservado.");
    return;
  }

  const [products, gallery] = await Promise.all([
    fetchRows(
      supabaseUrl,
      anonKey,
      "products",
      "id,name,category,recommended_age,size,allows_water,capacity,price,description,features,image_path,active",
      "created_at.asc",
    ),
    fetchRows(
      supabaseUrl,
      anonKey,
      "gallery_images",
      "id,image_path,alt_text,sort_order,active",
      "sort_order.asc",
    ),
  ]);

  await mkdir(dataDirectory, { recursive: true });
  await rm(temporaryImagesDirectory, { recursive: true, force: true });
  await mkdir(temporaryImagesDirectory, { recursive: true });

  const backupProducts = await Promise.all(
    products.map(async (product) => {
      const image = await mirrorImage(
        supabaseUrl,
        product.image_path,
        temporaryImagesDirectory,
      );
      return {
        id: String(product.id),
        name: String(product.name),
        category: String(product.category),
        age: String(product.recommended_age || "Livre"),
        size: String(product.size || "Consultar"),
        wet: Boolean(product.allows_water),
        capacity: String(product.capacity || "Consultar"),
        price: product.price === null ? null : Number(product.price),
        image,
        fallbackImage: image,
        imagePath: null,
        description: String(product.description || ""),
        features: Array.isArray(product.features) ? product.features.map(String) : [],
        active: true,
      };
    }),
  );

  const backupGallery = await Promise.all(
    gallery.map(async (image) => {
      const localImage = await mirrorImage(
        supabaseUrl,
        image.image_path,
        temporaryImagesDirectory,
      );
      return {
        id: String(image.id),
        image: localImage,
        fallbackImage: localImage,
        image_path: null,
        alt_text: String(image.alt_text || "Foto da Monteiro Locações"),
        sort_order: Number(image.sort_order || 0),
        active: true,
      };
    }),
  );

  const temporaryPath = `${backupPath}.tmp`;
  await writeFile(
    temporaryPath,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), products: backupProducts, gallery: backupGallery }, null, 2)}\n`,
  );
  await rm(imagesDirectory, { recursive: true, force: true });
  await rename(temporaryImagesDirectory, imagesDirectory);
  await rename(temporaryPath, backupPath);
  console.info(`[catalog-backup] Backup atualizado com ${backupProducts.length} produtos e ${backupGallery.length} fotos.`);
}

buildBackup().catch((error) => {
  console.warn(`[catalog-backup] Não foi possível atualizar o backup. A última versão será preservada. ${error.message}`);
});
