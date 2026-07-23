import { Image } from "@/components/ui/image";
const photos=[
  {url:"/images/galeria-toboga.png",alt:"Festa de aniversário com tobogã inflável"},
  {url:"/images/galeria-doces.png",alt:"Estação de algodão doce e decoração"},
  {url:"/images/galeria-brinquedos.png",alt:"Festa com pula-pula e piscina de bolinhas"}
];
export default function Gallery(){return <section id="galeria" className="bg-white px-5 py-24 lg:px-8"><div className="mx-auto max-w-7xl"><div className="mx-auto mb-12 max-w-2xl text-center"><p className="mb-3 text-sm font-black uppercase tracking-[.2em] text-[#00BFFF]">Galeria</p><h2 className="text-4xl font-black tracking-[-.03em] text-gray-900 sm:text-5xl">Festas e Eventos</h2><p className="mt-4 text-lg text-gray-500">Veja como nossas atrações transformam festas em experiências memoráveis</p></div><div className="grid gap-5 md:grid-cols-3">{photos.map(p=><div key={p.url} className="overflow-hidden rounded-2xl shadow-sm transition hover:shadow-xl"><Image src={p.url} alt={p.alt} className="h-64 w-full" fittingType="fill"/></div>)}</div></div></section>}
