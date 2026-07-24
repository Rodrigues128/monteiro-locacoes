import { Image } from "@/components/ui/image"

const photos = [
  { url: "/images/real/evento-com-criancas.jpeg", alt: "Crianças brincando no pula-pula em um evento atendido pela Monteiro Locações" },
  { url: "/images/real/montagem-completa-real.jpeg", alt: "Montagem completa com brinquedos e estrutura para festa" },
  { url: "/images/real/recreacao-real.jpeg", alt: "Espaço de recreação preparado pela Monteiro Locações" },
  { url: "/images/real/mesas-cadeiras-real.jpeg", alt: "Mesas e cadeiras organizadas para receber os convidados" },
  { url: "/images/real/sinuca-real.jpeg", alt: "Mesa de sinuca instalada em uma confraternização" },
  { url: "/images/real/piscina-bolinhas-real.jpeg", alt: "Piscina de bolinhas montada para uma festa infantil" },
]

export default function Gallery() {
  return <section id="galeria" className="bg-white px-5 py-24 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-3 text-sm font-black uppercase tracking-[.2em] text-[#00BFFF]">Galeria real</p>
        <h2 className="text-4xl font-black tracking-[-.03em] text-gray-900 sm:text-5xl">Festas que já fizemos</h2>
        <p className="mt-4 text-lg text-gray-500">Registros reais de brinquedos, jogos e estruturas montados pela nossa equipe.</p>
      </div>
      <div className="grid auto-rows-[220px] gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => <div key={photo.url} className={`group overflow-hidden rounded-2xl bg-gray-100 shadow-sm ${index === 0 ? "sm:row-span-2" : ""}`}><Image src={photo.url} alt={photo.alt} className="h-full w-full transition duration-500 group-hover:scale-105" fittingType="fill" /></div>)}
      </div>
    </div>
  </section>
}
