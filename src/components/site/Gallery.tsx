import { useCallback, useEffect, useState } from "react";
import { Image } from "@/components/ui/image";
import { fetchPublicGallery } from "@/lib/catalog";

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("live");
  const [updatedAt, setUpdatedAt] = useState(null);

  const loadGallery = useCallback(async () => {
    setLoading(true);

    const result = await fetchPublicGallery();
    setPhotos(result.gallery);
    setSource(result.source);
    setUpdatedAt(result.updatedAt);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadGallery();
  }, [loadGallery]);

  const lastSavedLabel = updatedAt
    ? new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(updatedAt))
    : null;

  return (
    <section id="galeria" className="bg-white px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-black uppercase tracking-[.2em] text-[#00BFFF]">
            Galeria real
          </p>
          <h2 className="text-4xl font-black tracking-[-.03em] text-gray-900 sm:text-5xl">
            Festas que já fizemos
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Registros reais de brinquedos, jogos e estruturas montados pela
            nossa equipe.
          </p>
        </div>

        {!loading && source !== "live" && photos.length > 0 && (
          <div
            role="status"
            className="mx-auto mb-8 flex max-w-4xl flex-col items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm text-amber-900 sm:flex-row sm:text-left"
          >
            <p>
              <strong>Galeria em modo de contingência.</strong>{" "}
              {source === "cache"
                ? `Usamos a última versão salva${lastSavedLabel ? ` em ${lastSavedLabel}` : ""}.`
                : source === "backup"
                  ? `Usamos a última cópia global publicada${lastSavedLabel ? ` em ${lastSavedLabel}` : ""}.`
                  : "Mostramos fotos locais temporárias enquanto reconectamos ao sistema."}
            </p>
            <button
              type="button"
              onClick={() => void loadGallery()}
              className="shrink-0 rounded-xl border border-amber-300 bg-white px-4 py-2 font-bold text-amber-900 transition hover:bg-amber-100"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {loading && (
          <p className="py-8 text-center text-gray-500">Carregando fotos...</p>
        )}
        {!loading && !photos.length && (
          <p className="py-8 text-center text-gray-500">
            Ainda não há fotos na galeria.
          </p>
        )}
        <div className="grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className={`group overflow-hidden rounded-2xl bg-gray-100 shadow-sm ${index === 0 ? "sm:row-span-2" : ""}`}
            >
              <Image
                src={photo.image}
                onError={(event) => {
                  event.currentTarget.src = photo.fallbackImage;
                }}
                alt={photo.alt_text}
                className="h-full w-full transition duration-500 group-hover:scale-105"
                fittingType="fill"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
