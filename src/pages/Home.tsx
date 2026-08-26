import { useEffect, useState } from "react";
import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import Catalog from "@/components/site/Catalog";
import Services from "@/components/site/Services";
import Process from "@/components/site/Process";
import Gallery from "@/components/site/Gallery";
import Testimonials from "@/components/site/Testimonials";
import Footer from "@/components/site/Footer";
import CartDrawer from "@/components/site/CartDrawer";

const CART_KEY = "monteiro-locacoes-cart";
const CART_DRAFT_VERSION = 1;
const CART_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000;

type CatalogProduct = {
  id: string;
  name: string;
  price: number | null;
  [key: string]: unknown;
};

type CartProduct = CatalogProduct & {
  quantity: number;
};

type CartDraft = {
  version: number;
  items: CartProduct[];
  eventDate: string;
  eventTime: string;
  updatedAt: string;
};

function createEmptyCartDraft(): CartDraft {
  return {
    version: CART_DRAFT_VERSION,
    items: [],
    eventDate: "",
    eventTime: "",
    updatedAt: new Date().toISOString(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCartProduct(value: unknown): value is CartProduct {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    (typeof value.price === "number" || value.price === null)
  );
}

function loadCartDraft(): CartDraft {
  if (typeof window === "undefined") return createEmptyCartDraft();

  try {
    const savedCart = window.localStorage.getItem(CART_KEY);
    if (!savedCart) return createEmptyCartDraft();

    const parsed: unknown = JSON.parse(savedCart);
    const isLegacyCart = Array.isArray(parsed);
    const storedDraft = isRecord(parsed) ? parsed : {};
    const possibleItems = isLegacyCart
      ? parsed
      : Array.isArray(storedDraft.items)
        ? storedDraft.items
        : [];
    const updatedAt = isLegacyCart
      ? new Date().toISOString()
      : storedDraft.updatedAt;
    if (typeof updatedAt !== "string") {
      window.localStorage.removeItem(CART_KEY);
      return createEmptyCartDraft();
    }
    const updatedAtTimestamp =
      Date.parse(updatedAt);

    if (
      Number.isNaN(updatedAtTimestamp) ||
      Date.now() - updatedAtTimestamp > CART_EXPIRATION_MS
    ) {
      window.localStorage.removeItem(CART_KEY);
      return createEmptyCartDraft();
    }

    return {
      version: CART_DRAFT_VERSION,
      items: possibleItems.filter(isCartProduct),
      eventDate:
        typeof storedDraft.eventDate === "string" ? storedDraft.eventDate : "",
      eventTime:
        typeof storedDraft.eventTime === "string" ? storedDraft.eventTime : "",
      updatedAt,
    };
  } catch {
    return createEmptyCartDraft();
  }
}

export default function Home() {
  const [cartDraft, setCartDraft] = useState<CartDraft>(loadCartDraft);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const cart = cartDraft.items;

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CART_KEY,
        JSON.stringify({
          ...cartDraft,
          version: CART_DRAFT_VERSION,
          updatedAt: new Date().toISOString(),
        }),
      );
    } catch {
      // O carrinho continua utilizável mesmo sem acesso ao armazenamento local.
    }
  }, [cartDraft]);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const add = (product: CatalogProduct) => {
    setCartDraft((draft) => ({
      ...draft,
      items: draft.items.some((item) => item.id === product.id)
        ? draft.items
        : [...draft.items, { ...product, quantity: 1 }],
    }));
    setNotice(`${product.name} foi adicionado à sacola`);
  };

  const changeQuantity = (id: string, change: number) => {
    setCartDraft((draft) => ({
      ...draft,
      items: draft.items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item,
      ),
    }));
  };

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const addedIds = cart.map((item) => item.id);

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
        onRemove={(id: string) =>
          setCartDraft((draft) => ({
            ...draft,
            items: draft.items.filter((item) => item.id !== id),
          }))
        }
        onQuantityChange={changeQuantity}
        date={cartDraft.eventDate}
        time={cartDraft.eventTime}
        onDateChange={(eventDate: string) =>
          setCartDraft((draft) => ({ ...draft, eventDate }))
        }
        onTimeChange={(eventTime: string) =>
          setCartDraft((draft) => ({ ...draft, eventTime }))
        }
      />
      <div
        aria-live="polite"
        className={`fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-xl transition ${
          notice
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        {notice}
      </div>
    </main>
  );
}
