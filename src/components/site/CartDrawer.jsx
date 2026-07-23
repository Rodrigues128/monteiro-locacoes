import { Calendar, Check, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

/**
 * @typedef {{
 *   id: number,
 *   name: string,
 *   price: number,
 *   quantity?: number
 * }} CartItem
 *
 * @typedef {{
 *   open: boolean,
 *   items: CartItem[],
 *   onClose: () => void,
 *   onRemove: (id: number) => void,
 *   onQuantityChange: (id: number, change: number) => void
 * }} CartDrawerProps
 */

export default function CartDrawer(/** @type {CartDrawerProps} */ {
  open,
  items,
  onClose,
  onRemove,
  onQuantityChange,
}) {
  const [date, setDate] = useState("")
  const closeButton = useRef(/** @type {HTMLButtonElement | null} */ (null))
  const total = items.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  )
  const today = new Date().toLocaleDateString("en-CA")

  useEffect(() => {
    if (!open) return undefined
    closeButton.current?.focus()
    document.body.style.overflow = "hidden"
    /** @param {KeyboardEvent} event */
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = ""
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onClose])

  const send = () => {
    const list = items
      .map((item) => `• ${item.quantity || 1}x ${item.name}`)
      .join("\n")
    const text = `Olá! Gostaria de consultar disponibilidade para ${
      date || "uma data a combinar"
    }:\n${list}\nValor estimado: R$ ${total},00`
    window.open(
      `https://wa.me/5567981396452?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl transition duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#00BFFF]">
              Seu evento
            </p>
            <h2 id="cart-title" className="text-2xl font-black text-gray-900">
              Sua sacola
            </h2>
          </div>
          <button
            ref={closeButton}
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-gray-500 focus-visible:outline-[#00BFFF]"
            aria-label="Fechar sacola"
          >
            <X size={18} />
          </button>
        </div>

        <div className="my-6 flex items-center justify-between text-[10px] font-bold text-gray-400">
          {["ENTREGA", "MONTAGEM", "FESTA", "RETIRADA"].map((label, index) => (
            <span key={label} className="flex items-center gap-1">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-[#00BFFF] text-white">
                {index + 1}
              </span>
              {label}
            </span>
          ))}
        </div>

        <div className="flex-1 space-y-3 overflow-auto">
          {!items.length && (
            <div className="grid h-48 place-items-center text-center text-gray-400">
              <div>
                <ShoppingBag className="mx-auto mb-3" />
                <p>Seu pedido está vazio.<br />Adicione atrações do catálogo.</p>
              </div>
            </div>
          )}
          {items.map((item) => (
            <div key={item.id} className="rounded-xl bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-400">
                    R$ {item.price * (item.quantity || 1)},00
                  </p>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-gray-300 hover:text-red-500 focus-visible:outline-red-500"
                  aria-label={`Remover ${item.name}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="mt-3 inline-flex items-center rounded-full border border-gray-200 bg-white p-1">
                <button
                  onClick={() => onQuantityChange(item.id, -1)}
                  disabled={(item.quantity || 1) === 1}
                  className="grid h-7 w-7 place-items-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                  aria-label={`Diminuir quantidade de ${item.name}`}
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-black">
                  {item.quantity || 1}
                </span>
                <button
                  onClick={() => onQuantityChange(item.id, 1)}
                  className="grid h-7 w-7 place-items-center rounded-full text-gray-500 hover:bg-gray-100"
                  aria-label={`Aumentar quantidade de ${item.name}`}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <label className="mt-4 text-sm font-bold text-gray-700">
          <Calendar className="mr-2 inline" size={16} />
          Data do evento
        </label>
        <input
          type="date"
          min={today}
          value={date}
          onChange={(/** @type {import("react").ChangeEvent<HTMLInputElement>} */ event) =>
            setDate(event.target.value)
          }
          className="mt-2 rounded-full border border-gray-200 bg-gray-50 px-5 py-3 outline-none focus:border-[#00BFFF]"
        />
        <div className="mt-4 flex justify-between text-lg font-black text-gray-900">
          <span>Valor estimado</span>
          <span>R$ {total},00</span>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Frete e disponibilidade serão confirmados pelo WhatsApp.
        </p>
        <button
          disabled={!items.length}
          onClick={send}
          className="mt-4 flex items-center justify-center gap-2 rounded-full bg-[#25D366] py-4 font-bold text-white focus-visible:outline-slate-900 disabled:opacity-30"
        >
          <Check size={18} />
          Consultar no WhatsApp
        </button>
      </aside>
    </>
  )
}
