import { getImageUrl, supabase } from "@/lib/supabase"

/** @typedef {{ id: string, name: string, category: string, age: string, size: string, wet: boolean, capacity: string, price: number | null, image: string, fallbackImage: string, imagePath: string | null, description: string, features: string[], active: boolean }} Product */

const realImages = new Set([
  "toboga-real.jpeg", "pula-pula-real.jpeg", "piscina-bolinhas-real.jpeg",
  "mesas-cadeiras-real.jpeg", "sinuca-real.jpeg", "pebolim-real.jpeg",
  "aero-hockey-real.jpeg", "evento-com-criancas.jpeg", "montagem-completa-real.jpeg",
  "recreacao-real.jpeg",
])

/** @param {string | null} path */
function getLegacyImageUrl(path) {
  if (!path) return ""
  const filename = path.split("/").pop()
  return filename ? `${realImages.has(filename) ? "/images/real" : "/images"}/${filename}` : ""
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
    image: getImageUrl(/** @type {string | null} */ (product.image_path || null)),
    fallbackImage: getLegacyImageUrl(/** @type {string | null} */ (product.image_path || null)),
    imagePath: /** @type {string | null} */ (product.image_path || null),
    description: String(product.description || ""),
    features: Array.isArray(product.features) ? product.features.map(String) : [],
    active: Boolean(product.active),
  }
}

export async function fetchProducts(includeInactive = false) {
  if (!supabase) throw new Error("Supabase não configurado.")
  let query = supabase.from("products").select("*").order("created_at", { ascending: true })
  if (!includeInactive) query = query.eq("active", true)
  const { data, error } = await query
  if (error) throw error
  return data.map(mapProduct)
}

export async function fetchGallery(includeInactive = false) {
  if (!supabase) throw new Error("Supabase não configurado.")
  let query = supabase.from("gallery_images").select("*").order("sort_order")
  if (!includeInactive) query = query.eq("active", true)
  const { data, error } = await query
  if (error) throw error
  return data.map((image) => ({ ...image, image: getImageUrl(image.image_path), fallbackImage: getLegacyImageUrl(image.image_path) }))
}
