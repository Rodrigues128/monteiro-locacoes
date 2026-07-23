import { useState } from "react";
import ProductCard from "@/components/site/ProductCard";
import ProductDetail from "@/components/site/ProductDetail";
import { categories, products } from "@/data/products";

export default function Catalog({ onAdd, addedIds }) {
  const [category, setCategory] = useState("Todos");
  const [selected, setSelected] = useState(null);
  const visible = category === "Todos" ? products : products.filter(p => p.category === category);
  return <section id="atracoes" className="bg-[#F9FAFB] px-5 py-24 lg:px-8">
    <div className="mx-auto max-w-7xl"><div className="mx-auto mb-12 max-w-2xl text-center"><p className="mb-3 text-sm font-black uppercase tracking-[.2em] text-[#00BFFF]">Catálogo</p><h2 className="text-4xl font-black tracking-[-.03em] text-gray-900 sm:text-5xl">Nossas Atrações</h2><p className="mt-4 text-lg text-gray-500">Tudo o que sua festa precisa, selecionado, higienizado e montado pela nossa equipe.</p></div>
      <div className="mb-10 flex flex-wrap justify-center gap-2">{categories.map(item=><button key={item} onClick={()=>setCategory(item)} className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition ${category===item?'bg-[#00BFFF] text-white shadow-md':'bg-white text-gray-500 shadow-sm hover:text-gray-900'}`}>{item}</button>)}</div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{visible.map(product=><ProductCard key={product.id} product={product} onAdd={onAdd} onDetails={setSelected} added={addedIds.includes(product.id)}/>)}</div>
    </div><ProductDetail product={selected} onClose={()=>setSelected(null)} onAdd={p=>{onAdd(p);setSelected(null)}}/>
  </section>;
}
