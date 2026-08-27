import { getImageUrl, supabase } from "@/lib/supabase";
import { fallbackGallery, fallbackProducts } from "@/data/catalogFallback";

/** @typedef {{ id: string, name: string, category: string, age: string, size: string, wet: boolean, capacity: string, price: number | null, image: string, fallbackImage: string, imagePath: string | null, description: string, features: string[], active: boolean }} Product */

const realImages = new Set([
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
]);

const PRODUCTS_CACHE_KEY = "monteiro-locacoes-public-products";
const GALLERY_CACHE_KEY = "monteiro-locacoes-public-gallery";

type CachedContent<T> = {
  data: T[];
  updatedAt: string;
};

type PublishedBackup = {
  generatedAt: string;
  products: ReturnType<typeof mapProduct>[];
  gallery: ReturnType<typeof mapGalleryImage>[];
};

function readCache<T>(key: string): CachedContent<T> | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = window.localStorage.getItem(key);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as CachedContent<T>;
    return Array.isArray(parsed.data) && parsed.updatedAt ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({ data, updatedAt: new Date().toISOString() }),
    );
  } catch {
    // A indisponibilidade do armazenamento local não deve bloquear o catálogo.
  }
}

async function readPublishedBackup(): Promise<PublishedBackup | null> {
  if (typeof window === "undefined") return null;

  try {
    const response = await fetch("/data/catalog-backup.json", {
      cache: "no-store",
    });
    if (!response.ok) return null;

    const backup = (await response.json()) as PublishedBackup;
    return Array.isArray(backup.products) && Array.isArray(backup.gallery)
      ? backup
      : null;
  } catch {
    return null;
  }
}

/** @param {string | null} path */
function getLegacyImageUrl(path) {
  if (!path) return "";
  const filename = path.split("/").pop();
  return filename
    ? `${realImages.has(filename) ? "/images/real" : "/images"}/${filename}`
    : "";
}

/** @param {Record<string, unknown>} product */
export function mapProduct(product) {
  return {
    id: String(product.id),
    name: String(product.name),
    category: String(product.category),
    age: String(product.recommended_age || "Livre"),
    size: String(product.size || "Consultar"),
    wet: Boolean(product.allows_water),
    capacity: String(product.capacity || "Consultar"),
    price: product.price === null ? null : Number(product.price),
    image: getImageUrl(
      /** @type {string | null} */ (product.image_path || null),
    ),
    fallbackImage: getLegacyImageUrl(
      /** @type {string | null} */ (product.image_path || null),
    ),
    imagePath: /** @type {string | null} */ (product.image_path || null),
    description: String(product.description || ""),
    features: Array.isArray(product.features)
      ? product.features.map(String)
      : [],
    active: Boolean(product.active),
  };
}

export async function fetchProducts(includeInactive = false) {
  if (!supabase) throw new Error("Supabase não configurado.");
  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });
  if (!includeInactive) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw error;
  return data.map(mapProduct);
}


export async function fetchPublicProducts() {
  try {
    const products = await fetchProducts();
    writeCache(PRODUCTS_CACHE_KEY, products);
    return {
      products,
      source: "live" as const,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    const cached = readCache<ReturnType<typeof mapProduct>>(PRODUCTS_CACHE_KEY);
    const publishedBackup = await readPublishedBackup();
    const backupIsNewer =
      publishedBackup &&
      (!cached ||
        new Date(publishedBackup.generatedAt).getTime() >
          new Date(cached.updatedAt).getTime());

    if (backupIsNewer) {
      return {
        products: publishedBackup.products,
        source: "backup" as const,
        updatedAt: publishedBackup.generatedAt,
      };
    }

    if (cached) {
      return { products: cached.data, source: "cache" as const, updatedAt: cached.updatedAt };
    }

    return { products: fallbackProducts, source: "fallback" as const, updatedAt: null };
  }
}

export async function fetchGallery(includeInactive = false) {
  if (!supabase) throw new Error("Supabase não configurado.");
  let query = supabase.from("gallery_images").select("*").order("sort_order");
  if (!includeInactive) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw error;
  return data.map((image) => ({
    ...image,
    image: getImageUrl(image.image_path),
    fallbackImage: getLegacyImageUrl(image.image_path),
  }));
}


export async function fetchPublicGallery() {
  try {
    const gallery = await fetchGallery();
    writeCache(GALLERY_CACHE_KEY, gallery);
    return {
      gallery,
      source: "live" as const,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    const cached = readCache<ReturnType<typeof mapGalleryImage>>(GALLERY_CACHE_KEY);
    const publishedBackup = await readPublishedBackup();
    const backupIsNewer =
      publishedBackup &&
      (!cached ||
        new Date(publishedBackup.generatedAt).getTime() >
          new Date(cached.updatedAt).getTime());

    if (backupIsNewer) {
      return {
        gallery: publishedBackup.gallery,
        source: "backup" as const,
        updatedAt: publishedBackup.generatedAt,
      };
    }

    if (cached) {
      return { gallery: cached.data, source: "cache" as const, updatedAt: cached.updatedAt };
    }

    return { gallery: fallbackGallery, source: "fallback" as const, updatedAt: null };
  }
}

/** @param {Record<string, unknown>} image */
export function mapGalleryImage(image) {
  return {
    ...image,
    image: getImageUrl(/** @type {string | null} */ (image.image_path || null)),
    fallbackImage: getLegacyImageUrl(
      /** @type {string | null} */ (image.image_path || null),
    ),
  };
}
