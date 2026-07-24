import { ArrowUpRight, Check } from "lucide-react"
import { Image } from "@/components/ui/image"
import WhatsAppIcon from "@/components/WhatsAppIcon"

const WHATSAPP = "https://wa.me/5567981396452"

/** @typedef {import("@/lib/catalog").Product} Product */
/** @typedef {{ product: Product, onAdd: (product: Product) => void, onDetails: (product: Product) => void, added: boolean }} ProductCardProps */

export default function ProductCard(/** @type {ProductCardProps} */ { product, onAdd, onDetails, added }) {
  const priceLabel = product.price === null ? "valor sob consulta" : `R$ ${product.price},00`
  const waLink = `${WHATSAPP}?text=${encodeURIComponent(`Olá! Tenho interesse em alugar: ${product.name} (${priceLabel})`)}`

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <button onClick={() => onDetails(product)} className="relative block h-56 w-full overflow-hidden bg-gray-50 text-left">
        <Image src={product.image} onError={(event) => { event.currentTarget.src = product.fallbackImage }} alt={product.name} className="h-full w-full transition duration-500 group-hover:scale-105" fittingType="fill" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 font-mono text-xs font-medium text-gray-600 shadow-sm backdrop-blur">{product.size}</span>
        <span className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-[#00BFFF] text-white opacity-0 shadow-lg transition group-hover:opacity-100"><ArrowUpRight size={18} /></span>
      </button>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-black text-gray-900">{product.name}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{product.description}</p>
        <ul className="mt-4 space-y-2">{product.features.map((feature) => <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-600"><span className="h-2 w-2 shrink-0 rounded-full bg-[#00BFFF]" />{feature}</li>)}</ul>
        <div className="mt-5"><p className="text-xs text-gray-400">{product.price === null ? "Consulte a equipe" : "A partir de"}</p><p className="text-2xl font-black text-gray-900">{product.price === null ? "Sob consulta" : `R$ ${product.price},00`}</p></div>
        <div className="mt-5 flex gap-2">
          <button onClick={() => onAdd(product)} disabled={added} className={`flex-1 rounded-full py-3 text-sm font-bold transition ${added ? "cursor-default bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{added ? <span className="inline-flex items-center gap-1.5"><Check size={16} />Na sacola</span> : "Adicionar"}</button>
          <a href={waLink} target="_blank" rel="noreferrer" className="flex flex-[1.4] items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 text-sm font-bold text-white transition hover:brightness-110"><WhatsAppIcon size={17} white /> Falar no WhatsApp</a>
        </div>
      </div>
    </article>
  )
}
