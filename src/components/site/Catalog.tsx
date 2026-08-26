import { useCallback, useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/site/ProductCard";
import ProductDetail from "@/components/site/ProductDetail";
import { fetchPublicProducts } from "@/lib/catalog";

/** @typedef {import("@/lib/catalog").Product} Product */
/** @typedef {{ onAdd: (product: Product) => void, addedIds: string[] }} CatalogProps */

const catalogCategories = [
  "Infláveis",
  "Brinquedos",
  "Jogos",
  "Doces",
  "Decoração",
  "Estrutura",
  "Serviços",
];

export default function Catalog(
  /** @type {CatalogProps} */ { onAdd, addedIds },
) {
  const [category, setCategory] = useState("Todos");
  const [selected, setSelected] = useState(
    /** @type {Product | null} */ (null),
  );
  const [products, setProducts] = useState(/** @type {Product[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [source, setSource] = useState("live");
  const [updatedAt, setUpdatedAt] = useState(/** @type {string | null} */ (null));

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await fetchPublicProducts();
      setProducts(result.products);
      setSource(result.source);
      setUpdatedAt(result.updatedAt);
    } catch {
      setError("Não foi possível preparar o catálogo agora.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const categories = useMemo(
    () => [
      "Todos",
      ...new Set([
        ...catalogCategories,
        ...products.map((product) => product.category),
      ]),
    ],
    [products],
  );
  const visible =
    category === "Todos"
      ? products
      : products.filter((product) => product.category === category);

  const lastSavedLabel = updatedAt
    ? new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(updatedAt))
    : null;

  return (
    <section id="atracoes" className="bg-[#F9FAFB] px-5 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-black uppercase tracking-[.2em] text-[#00BFFF]">
            Catálogo
          </p>
          <h2 className="text-4xl font-black tracking-[-.03em] text-gray-900 sm:text-5xl">
            Nossas Atrações
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Tudo o que sua festa precisa, selecionado, higienizado e montado
            pela nossa equipe.
          </p>
        </div>

        {!loading && source !== "live" && products.length > 0 && (
          <div
            role="status"
            className="mb-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-center text-sm text-amber-900 sm:flex-row sm:text-left"
          >
            <p>
              <strong>Catálogo em modo de contingência.</strong>{" "}
              {source === "cache"
                ? `Exibimos a última versão salva${lastSavedLabel ? ` em ${lastSavedLabel}` : ""}.`
                : source === "backup"
                  ? `Exibimos a última cópia global publicada${lastSavedLabel ? ` em ${lastSavedLabel}` : ""}.`
                  : "Exibimos uma versão local temporária enquanto reconectamos ao sistema."}
            </p>
            <button
              type="button"
              onClick={() => void loadCatalog()}
              className="shrink-0 rounded-xl border border-amber-300 bg-white px-4 py-2 font-bold text-amber-900 transition hover:bg-amber-100"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition ${category === item ? "bg-[#00BFFF] text-white shadow-md" : "bg-white text-gray-500 shadow-sm hover:text-gray-900"}`}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <p className="py-14 text-center text-gray-500">
            Carregando atrações...
          </p>
        )}
        {error && (
          <p className="rounded-2xl bg-red-50 p-5 text-center text-red-700">
            {error} Tente atualizar a página em alguns instantes.
          </p>
        )}
        {!loading && !error && !products.length && (
          <p className="py-14 text-center text-gray-500">
            Ainda não há atrações disponíveis no catálogo.
          </p>
        )}
        {!loading && !error && products.length > 0 && !visible.length && (
          <p className="py-10 text-center text-gray-500">
            Nenhum item cadastrado nesta categoria.
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={onAdd}
              onDetails={setSelected}
              added={addedIds.includes(product.id)}
            />
          ))}
        </div>
      </div>
      <ProductDetail
        product={selected}
        onClose={() => setSelected(null)}
        onAdd={(product) => {
          onAdd(product);
          setSelected(null);
        }}
      />
    </section>
  );
}
