import { Check, Ruler, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

/** @typedef {import("@/lib/catalog").Product} Product */
/** @typedef {{ product: Product | null, onClose: () => void, onAdd: (product: Product) => void }} ProductDetailProps */

/** @param {string} size */
function getDimensions(size) {
  const match = size.match(/(\d+(?:[.,]\d+)?)\s*×\s*(\d+(?:[.,]\d+)?)/)
  if (!match) return null
  return [Number(match[1].replace(",", ".")), Number(match[2].replace(",", "."))]
}

export default function ProductDetail(/** @type {ProductDetailProps} */ { product, onClose, onAdd }) {
  const [width, setWidth] = useState("")
  const [length, setLength] = useState("")
  const closeButton = useRef(/** @type {HTMLButtonElement | null} */ (null))

  useEffect(() => {
    if (!product) return undefined
    setWidth("")
    setLength("")
    closeButton.current?.focus()
    /** @param {KeyboardEvent} event */
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [product, onClose])

  if (!product) return null

  const needed = getDimensions(product.size)
  const hasMeasurements = Number(width) > 0 && Number(length) > 0
  const fits =
    needed &&
    hasMeasurements &&
    ((Number(width) >= needed[0] && Number(length) >= needed[1]) ||
      (Number(width) >= needed[1] && Number(length) >= needed[0]))

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-0 backdrop-blur-sm sm:place-items-center sm:p-5"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-title"
        onClick={(/** @type {import("react").MouseEvent<HTMLDivElement>} */ event) =>
          event.stopPropagation()
        }
        className="w-full max-w-lg rounded-t-3xl border border-gray-100 bg-white p-7 shadow-2xl sm:rounded-3xl sm:p-9"
      >
        <div className="flex justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#00BFFF]">
              {product.category}
            </p>
            <h2 id="product-title" className="mt-2 text-3xl font-black tracking-tight text-gray-900">
              {product.name}
            </h2>
          </div>
          <button
            ref={closeButton}
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gray-100 text-gray-500 focus-visible:outline-[#00BFFF]"
            aria-label="Fechar detalhes"
          >
            <X size={18} />
          </button>
        </div>

        <p className="mt-4 leading-relaxed text-gray-500">{product.description}</p>

        <div className="my-6 grid grid-cols-3 gap-3 font-mono text-xs">
          <div className="rounded-xl bg-gray-50 p-4">
            <span className="text-gray-400">ESPAÇO</span><br />
            <span className="font-bold text-gray-700">{product.size}</span>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <span className="text-gray-400">IDADE</span><br />
            <span className="font-bold text-gray-700">{product.age}</span>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <span className="text-gray-400">CAPAC.</span><br />
            <span className="font-bold text-gray-700">{product.capacity}</span>
          </div>
        </div>

        <fieldset>
          <legend className="text-sm font-bold text-gray-700">
            <Ruler className="mr-2 inline" size={16} />
            Qual é o espaço disponível?
          </legend>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="text-xs font-bold text-gray-500">
              Largura (m)
              <input
                value={width}
                onChange={(/** @type {import("react").ChangeEvent<HTMLInputElement>} */ event) =>
                  setWidth(event.target.value)
                }
                type="number"
                min="0"
                step="0.1"
                placeholder="Ex: 5"
                className="mt-1.5 w-full rounded-full border border-gray-200 bg-gray-50 px-5 py-3 text-base font-normal text-gray-900 outline-none focus:border-[#00BFFF]"
              />
            </label>
            <label className="text-xs font-bold text-gray-500">
              Comprimento (m)
              <input
                value={length}
                onChange={(/** @type {import("react").ChangeEvent<HTMLInputElement>} */ event) =>
                  setLength(event.target.value)
                }
                type="number"
                min="0"
                step="0.1"
                placeholder="Ex: 8"
                className="mt-1.5 w-full rounded-full border border-gray-200 bg-gray-50 px-5 py-3 text-base font-normal text-gray-900 outline-none focus:border-[#00BFFF]"
              />
            </label>
          </div>
        </fieldset>

        {hasMeasurements && (
          <p className={`mt-3 flex items-center gap-2 text-sm ${fits ? "text-green-600" : "text-orange-500"}`}>
            <Check size={16} />
            {fits
              ? "Perfeito, esta atração cabe no espaço informado."
              : "Consulte nossa equipe para avaliar a montagem com segurança."}
          </p>
        )}

        <button
          onClick={() => onAdd(product)}
          className="mt-6 w-full rounded-full bg-[#00BFFF] px-6 py-3.5 font-bold text-white transition hover:brightness-105 focus-visible:outline-slate-900"
        >
          Adicionar à sacola
        </button>
      </div>
    </div>
  )
}
