import { adminSupabase } from "@/lib/adminApi";
import { mapGalleryImage, mapProduct } from "@/lib/catalog";

export async function fetchAdminProducts() {
  if (!adminSupabase) throw new Error("Painel administrativo não configurado.");
  const { data, error } = await adminSupabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data.map(mapProduct);
}

export async function fetchAdminGallery() {
  if (!adminSupabase) throw new Error("Painel administrativo não configurado.");
  const { data, error } = await adminSupabase
    .from("gallery_images")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data.map(mapGalleryImage);
}
