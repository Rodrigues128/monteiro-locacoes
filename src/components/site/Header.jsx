import { Menu, ShoppingBag, X } from "lucide-react"
import { useState } from "react"
import { Image } from "@/components/ui/image"

const links = [
  ["Atrações", "#atracoes"],
  ["Como Funciona", "#como-funciona"],
  ["Galeria", "#galeria"],
  ["Depoimentos", "#depoimentos"],
  ["Contato", "#contato"],
]

export default function Header({ count, onCart }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
        <a href="#inicio" className="flex items-center gap-3">
          <Image src="/images/logo.jpg" alt="Monteiro Locações" className="h-11 w-11 rounded-full" />
          <span className="hidden text-lg font-black tracking-tight text-gray-900 sm:inline">
            MONTEIRO <span className="text-gray-400">LOCAÇÕES</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-gray-600 md:flex">
          {links.map(([label, href]) => (
            <a key={href} className="transition hover:text-[#00BFFF] focus-visible:outline-[#00BFFF]" href={href}>
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onCart}
            className="relative grid h-11 w-11 place-items-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-[#00BFFF] hover:text-white focus-visible:outline-[#00BFFF]"
            aria-label={`Abrir pedido com ${count} ${count === 1 ? "item" : "itens"}`}
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#00BFFF] px-1 text-xs font-black text-white">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setMenuOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-full bg-gray-100 text-gray-700 md:hidden"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      <nav
        className={`overflow-hidden border-t border-gray-100 bg-white px-5 transition-all md:hidden ${
          menuOpen ? "max-h-96 py-4 opacity-100" : "max-h-0 py-0 opacity-0"
        }`}
        aria-label="Menu para celular"
      >
        {links.map(([label, href]) => (
          <a
            key={href}
            href={href}
            onClick={() => setMenuOpen(false)}
            className="block rounded-xl px-4 py-3 font-bold text-gray-700 hover:bg-gray-50 hover:text-[#00BFFF]"
          >
            {label}
          </a>
        ))}
      </nav>
    </header>
  )
}
