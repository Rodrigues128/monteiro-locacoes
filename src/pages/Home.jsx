import { useEffect, useState } from "react"
import Header from "@/components/site/Header"
import Hero from "@/components/site/Hero"
import Catalog from "@/components/site/Catalog"
import Services from "@/components/site/Services"
import Process from "@/components/site/Process"
import Gallery from "@/components/site/Gallery"
import Testimonials from "@/components/site/Testimonials"
import Footer from "@/components/site/Footer"
import CartDrawer from "@/components/site/CartDrawer"

const CART_KEY = "monteiro-locacoes-cart"

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || []
  } catch {
    return []
  }
}

export default function Home() {
  const [cart, setCart] = useState(loadCart)
  const [open, setOpen] = useState(false)
  const [notice, setNotice] = useState("")

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (!notice) return undefined
    const timeout = window.setTimeout(() => setNotice(""), 2200)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const add = (product) => {
    setCart((items) =>
      items.some((item) => item.id === product.id)
        ? items
        : [...items, { ...product, quantity: 1 }]
    )
    setNotice(`${product.name} foi adicionado à sacola`)
  }

  const changeQuantity = (id, change) => {
    setCart((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, (item.quantity || 1) + change) }
          : item
      )
    )
  }

  const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)
  const addedIds = cart.map((item) => item.id)

  return (
    <main className="min-h-screen bg-white">
      <Header count={count} onCart={() => setOpen(true)} />
      <Hero />
      <Catalog onAdd={add} addedIds={addedIds} />
      <Services />
      <Process />
      <Gallery />
      <Testimonials />
      <Footer />
      <CartDrawer
        open={open}
        items={cart}
        onClose={() => setOpen(false)}
        onRemove={(id) => setCart((items) => items.filter((item) => item.id !== id))}
        onQuantityChange={changeQuantity}
      />
      <div
        aria-live="polite"
        className={`fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-xl transition ${
          notice ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        {notice}
      </div>
    </main>
  )
}
