import { useEffect, useState } from "react"
import { Image } from "@/components/ui/image"
import { fetchGallery } from "@/lib/catalog"

export default function Gallery() {
  const [photos, setPhotos] = useState([])

  useEffect(() => { fetchGallery().then(setPhotos).catch(() => setPhotos([])) }, [])

  return <section id="galeria" className="bg-white px-5 py-24 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-3 text-sm font-black uppercase tracking-[.2em] text-[#00BFFF]">Galeria real</p>
        <h2 className="text-4xl font-black tracking-[-.03em] text-gray-900 sm:text-5xl">Festas que já fizemos</h2>
        <p className="mt-4 text-lg text-gray-500">Registros reais de brinquedos, jogos e estruturas montados pela nossa equipe.</p>
      </div>
      {!photos.length && <p className="py-8 text-center text-gray-500">Ainda não há fotos na galeria.</p>}
      <div className="grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => <div key={photo.id} className={`group overflow-hidden rounded-2xl bg-gray-100 shadow-sm ${index === 0 ? "sm:row-span-2" : ""}`}><Image src={photo.image} onError={(event) => { event.currentTarget.src = photo.fallbackImage }} alt={photo.alt_text} className="h-full w-full transition duration-500 group-hover:scale-105" fittingType="fill" /></div>)}
      </div>
    </div>
  </section>
}
