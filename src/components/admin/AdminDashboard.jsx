import { useState } from "react"
import {
  Check, ExternalLink, ImagePlus, Images, LayoutDashboard, LogOut,
  PackagePlus, Pencil, Power, Trash2, X,
} from "lucide-react"

function GalleryImageCard({ image, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false)
  const [altText, setAltText] = useState(image.alt_text)
  const [sortOrder, setSortOrder] = useState(String(image.sort_order))

  const save = () => {
    onUpdate(image, { alt_text: altText.trim(), sort_order: Number(sortOrder) || 0 })
    setEditing(false)
  }

  return (
    <article className="group overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={image.image}
          onError={(event) => { event.currentTarget.src = image.fallbackImage }}
          alt={image.alt_text}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black tracking-wide ${image.active ? "bg-emerald-400 text-emerald-950" : "bg-slate-950/75 text-white"}`}>
            {image.active ? "PUBLICADA" : "OCULTA"}
          </span>
          <button onClick={() => setEditing((value) => !value)} className="grid h-9 w-9 place-items-center rounded-xl bg-white/95 text-slate-700 shadow-sm transition hover:bg-white" aria-label="Editar informações da foto">
            <Pencil size={16} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-bold text-slate-700">{image.alt_text || "Foto sem descrição"}</p>
          <span className="shrink-0 text-xs font-bold text-slate-400">#{image.sort_order}</span>
        </div>
        {editing && (
          <div className="mt-4 rounded-2xl bg-slate-50 p-3">
            <label className="block text-xs font-bold text-slate-600">Descrição da foto
              <input value={altText} onChange={(event) => setAltText(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[#00BFFF]" />
            </label>
            <label className="mt-3 block text-xs font-bold text-slate-600">Posição na galeria
              <input type="number" min="0" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="mt-1.5 w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-[#00BFFF]" />
            </label>
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => setEditing(false)} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500" aria-label="Cancelar edição"><X size={16} /></button>
              <button onClick={save} className="grid h-9 w-9 place-items-center rounded-xl bg-[#00BFFF] text-white" aria-label="Salvar edição"><Check size={16} /></button>
            </div>
          </div>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <button onClick={() => onUpdate(image, { active: !image.active })} className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition hover:text-slate-900"><Power size={16} /> {image.active ? "Ocultar" : "Publicar"}</button>
          <button onClick={() => onRemove(image)} className="grid h-8 w-8 place-items-center rounded-lg text-red-500 transition hover:bg-red-50" aria-label="Excluir foto"><Trash2 size={16} /></button>
        </div>
      </div>
    </article>
  )
}

function EmptyState({ icon: Icon, title, description, action = undefined, children = null }) {
  return (
    <div className="mt-6 grid place-items-center rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-cyan-50 text-[#00BFFF]"><Icon size={30} /></span>
      <h3 className="mt-5 text-xl font-black">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
      {children || <button onClick={action} className="mt-6 rounded-xl bg-[#00BFFF] px-5 py-3 text-sm font-bold text-white">Começar agora</button>}
    </div>
  )
}

export default function AdminDashboard({ products, gallery, tab, setTab, setEditing, productForm, onSignOut, onToggleProduct, onRemoveProduct, onUploadGallery, onUpdateGallery, onRemoveGallery }) {
  const productsTab = tab === "products"
  const activeProducts = products.filter((product) => product.active).length
  const activeGallery = gallery.filter((image) => image.active).length

  return (
    <main className="min-h-screen bg-[#f3f8fa] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-slate-200 bg-white px-5 py-7 lg:flex">
          <a href="/" className="flex items-center gap-3 px-3"><img src="/images/logo.jpg" alt="Monteiro Locações" className="h-11 w-11 rounded-2xl object-cover" /><div><p className="font-black leading-none">MONTEIRO</p><p className="mt-1 text-[10px] font-black tracking-[.2em] text-[#00BFFF]">LOCAÇÕES</p></div></a>
          <p className="mt-12 px-3 text-[10px] font-black uppercase tracking-[.18em] text-slate-400">Gerenciamento</p>
          <nav className="mt-3 space-y-1">
            <button onClick={() => setTab("products")} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-bold transition ${productsTab ? "bg-[#00BFFF] text-white shadow-[0_10px_20px_rgba(0,191,255,0.18)]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}><LayoutDashboard size={18} /> Catálogo <span className={`ml-auto grid h-6 min-w-6 place-items-center rounded-lg px-1 text-xs ${productsTab ? "bg-white/20" : "bg-slate-100"}`}>{products.length}</span></button>
            <button onClick={() => setTab("gallery")} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-bold transition ${!productsTab ? "bg-[#00BFFF] text-white shadow-[0_10px_20px_rgba(0,191,255,0.18)]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}><Images size={18} /> Galeria <span className={`ml-auto grid h-6 min-w-6 place-items-center rounded-lg px-1 text-xs ${!productsTab ? "bg-white/20" : "bg-slate-100"}`}>{gallery.length}</span></button>
          </nav>
          <div className="mt-auto rounded-3xl bg-slate-950 p-5 text-white"><p className="text-sm font-black">Precisa conferir o site?</p><p className="mt-2 text-xs leading-relaxed text-slate-300">Veja como seus produtos e fotos aparecem para os clientes.</p><a href="/" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-cyan-300">Abrir site <ExternalLink size={14} /></a></div>
        </aside>

        <div className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 lg:hidden"><img src="/images/logo.jpg" alt="Monteiro Locações" className="h-11 w-11 rounded-2xl object-cover" /><p className="font-black">MONTEIRO<br /><span className="text-xs tracking-[.18em] text-[#00BFFF]">LOCAÇÕES</span></p></div>
            <div className="hidden lg:block"><p className="text-xs font-black uppercase tracking-[.2em] text-[#00BFFF]">Painel de gestão</p><h1 className="mt-2 text-3xl font-black tracking-[-.04em]">Olá, Monteiro!</h1></div>
            <div className="flex items-center gap-2"><a href="/" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold transition hover:border-[#00BFFF]"><ExternalLink size={16} /> <span className="hidden sm:inline">Ver site</span></a><button onClick={onSignOut} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"><LogOut size={16} /> <span className="hidden sm:inline">Sair</span></button></div>
          </header>
          <div className="mt-7 flex gap-2 overflow-auto pb-1 lg:hidden"><button onClick={() => setTab("products")} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${productsTab ? "bg-[#00BFFF] text-white" : "bg-white text-slate-600"}`}>Catálogo ({products.length})</button><button onClick={() => setTab("gallery")} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold ${!productsTab ? "bg-[#00BFFF] text-white" : "bg-white text-slate-600"}`}>Galeria ({gallery.length})</button></div>
          <section className="mt-8 grid gap-4 sm:grid-cols-2"><article className="rounded-3xl bg-gradient-to-br from-[#00BFFF] to-[#008fc0] p-6 text-white shadow-[0_14px_30px_rgba(0,191,255,0.2)]"><p className="text-sm font-bold text-white/80">Produtos publicados</p><p className="mt-3 text-4xl font-black">{activeProducts}<span className="ml-1 text-lg text-white/70">de {products.length}</span></p><p className="mt-5 text-xs font-semibold text-white/80">Itens ativos aparecem no catálogo público.</p></article><article className="rounded-3xl border border-slate-200 bg-white p-6"><p className="text-sm font-bold text-slate-500">Fotos na galeria</p><p className="mt-3 text-4xl font-black text-slate-900">{activeGallery}<span className="ml-1 text-lg text-slate-400">de {gallery.length}</span></p><p className="mt-5 text-xs font-semibold text-slate-400">Organize as fotos para mostrar seus eventos.</p></article></section>

          {productsTab ? <section className="mt-9"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#00BFFF]">Conteúdo do site</p><h2 className="mt-2 text-2xl font-black tracking-[-.03em]">Catálogo de atrações</h2><p className="mt-2 text-sm text-slate-500">Cadastre e mantenha seus produtos sempre atualizados.</p></div><button onClick={() => setEditing({})} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800"><PackagePlus size={18} /> Novo produto</button></div>{productForm && <div className="mt-6">{productForm}</div>}{!products.length ? <EmptyState icon={PackagePlus} title="Seu catálogo começa aqui" description="Adicione a primeira atração com foto, preço, medidas e tudo que o cliente precisa saber." action={() => setEditing({})} /> : <div className="mt-6 grid gap-4 xl:grid-cols-2">{products.map((product) => <article key={product.id} className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg"><img src={product.image} onError={(event) => { event.currentTarget.src = product.fallbackImage }} alt="" className="h-24 w-24 rounded-2xl bg-slate-100 object-cover" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><p className="text-xs font-bold text-[#00BFFF]">{product.category}</p><h3 className="mt-1 truncate font-black">{product.name}</h3></div><span className={`rounded-full px-2 py-1 text-[10px] font-black ${product.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>{product.active ? "ATIVO" : "INATIVO"}</span></div><div className="mt-4 flex gap-2"><button onClick={() => setEditing(product)} className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:text-slate-950" aria-label={`Editar ${product.name}`}><Pencil size={16} /></button><button onClick={() => onToggleProduct(product)} className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:text-slate-950" aria-label={`Alterar status de ${product.name}`}><Power size={16} /></button><button onClick={() => onRemoveProduct(product)} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100" aria-label={`Excluir ${product.name}`}><Trash2 size={16} /></button></div></div></article>)}</div>}</section> : <section className="mt-9"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#00BFFF]">Conteúdo do site</p><h2 className="mt-2 text-2xl font-black tracking-[-.03em]">Galeria de fotos</h2><p className="mt-2 text-sm text-slate-500">Mostre os melhores momentos e montagens dos seus eventos.</p></div><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800"><ImagePlus size={18} /> Adicionar fotos<input multiple type="file" accept="image/*" onChange={onUploadGallery} className="hidden" /></label></div>{!gallery.length ? <EmptyState icon={Images} title="Sua galeria ainda está vazia" description="Envie fotos reais dos brinquedos e eventos para dar mais confiança aos seus clientes."><label className="mt-6 cursor-pointer rounded-xl bg-[#00BFFF] px-5 py-3 text-sm font-bold text-white">Enviar primeiras fotos<input multiple type="file" accept="image/*" onChange={onUploadGallery} className="hidden" /></label></EmptyState> : <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{gallery.map((image) => <GalleryImageCard key={image.id} image={image} onUpdate={onUpdateGallery} onRemove={onRemoveGallery} />)}</div>}</section>}
        </div>
      </div>
    </main>
  )
}
