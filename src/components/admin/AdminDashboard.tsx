import { useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  CalendarClock,
  CalendarRange,
  Check,
  ClipboardCheck,
  CircleDollarSign,
  ExternalLink,
  FileCheck2,
  FileText,
  ImagePlus,
  Images,
  LayoutDashboard,
  LogOut,
  MessageSquarePlus,
  PackageCheck,
  PackagePlus,
  Pencil,
  Power,
  ReceiptText,
  Users,
  Trash2,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: () => void;
  children?: ReactNode;
};

type SidebarLinkProps = {
  href: string;
  icon: LucideIcon;
  children: ReactNode;
  count?: number;
  active?: boolean;
  primary?: boolean;
};

function GalleryImageCard({ image, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [altText, setAltText] = useState(image.alt_text);
  const [sortOrder, setSortOrder] = useState(String(image.sort_order));

  const save = () => {
    onUpdate(image, {
      alt_text: altText.trim(),
      sort_order: Number(sortOrder) || 0,
    });
    setEditing(false);
  };

  return (
    <>
      <article className="group overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={image.image}
            onError={(event) => {
              event.currentTarget.src = image.fallbackImage;
            }}
            alt={image.alt_text}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black tracking-wide ${image.active ? "bg-emerald-400 text-emerald-950" : "bg-slate-950/75 text-white"}`}>
              {image.active ? "PUBLICADA" : "OCULTA"}
            </span>
            <button onClick={() => setEditing(true)} className="grid h-9 w-9 place-items-center rounded-xl bg-white/95 text-slate-700 shadow-sm" aria-label="Editar foto">
              <Pencil size={16} />
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-bold text-slate-700">{image.alt_text || "Foto sem descrição"}</p>
            <span className="shrink-0 text-xs font-bold text-slate-400">#{image.sort_order}</span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <button onClick={() => onUpdate(image, { active: !image.active })} className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900">
              <Power size={16} /> {image.active ? "Ocultar" : "Publicar"}
            </button>
            <button onClick={() => onRemove(image)} className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-50" aria-label="Excluir foto">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </article>
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-5 backdrop-blur-sm" onClick={() => setEditing(false)}>
          <section role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[.18em] text-[#00BFFF]">Galeria</p>
                <h2 className="mt-2 text-2xl font-black">Editar foto</h2>
              </div>
              <button onClick={() => setEditing(false)} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500" aria-label="Fechar">
                <X size={18} />
              </button>
            </div>
            <label className="mt-6 block text-sm font-bold text-slate-700">
              Descrição da foto
              <input value={altText} onChange={(event) => setAltText(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#00BFFF]" />
            </label>
            <label className="mt-4 block text-sm font-bold text-slate-700">
              Posição na galeria
              <input type="number" min="0" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="mt-2 w-28 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#00BFFF]" />
            </label>
            <div className="mt-7 flex justify-end gap-3">
              <button onClick={() => setEditing(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold">Cancelar</button>
              <button onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-[#00BFFF] px-5 py-3 text-sm font-bold text-white"><Check size={16} /> Salvar</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function EmptyState({ icon: Icon, title, description, action, children }: EmptyStateProps) {
  return (
    <div className="mt-6 grid place-items-center rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-cyan-50 text-[#00BFFF]"><Icon size={30} /></span>
      <h3 className="mt-5 text-xl font-black">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">{description}</p>
      {children || <button onClick={action} className="mt-6 rounded-xl bg-[#00BFFF] px-5 py-3 text-sm font-bold text-white">Começar agora</button>}
    </div>
  );
}

function ProductCard({ product, onEdit, onToggle, onRemove }) {
  return (
    <article className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
      <img src={product.image} onError={(event) => { event.currentTarget.src = product.fallbackImage; }} alt="" className="h-24 w-24 rounded-2xl bg-slate-100 object-cover" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#00BFFF]">{product.category}</p>
            <h3 className="mt-1 truncate font-black">{product.name}</h3>
          </div>
          <span className={`rounded-full px-2 py-1 text-[10px] font-black ${product.active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>{product.active ? "ATIVO" : "INATIVO"}</span>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={() => onEdit(product)} className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:text-slate-950" aria-label={`Editar ${product.name}`}><Pencil size={16} /></button>
          <button onClick={() => onToggle(product)} className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:text-slate-950" aria-label={`${product.active ? "Desativar" : "Ativar"} ${product.name}`}><Power size={16} /></button>
          <button onClick={() => onRemove(product)} className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100" aria-label={`Excluir ${product.name}`}><Trash2 size={16} /></button>
        </div>
      </div>
    </article>
  );
}

function ProductCatalog({ products, productForm, setEditing, onToggleProduct, onRemoveProduct }) {
  const [filter, setFilter] = useState("all");
  const activeCount = products.filter((product) => product.active).length;
  const inactiveCount = products.length - activeCount;
  const filteredProducts = products.filter((product) => filter === "all" || product.active === (filter === "active"));
  const filters = [["all", `Todos (${products.length})`], ["active", `Ativos (${activeCount})`], ["inactive", `Inativos (${inactiveCount})`]];

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#00BFFF]">Conteúdo do site</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-.03em]">Catálogo de atrações</h2>
          <p className="mt-2 text-sm text-slate-500">Cadastre, edite e controle o que aparece para seus clientes.</p>
        </div>
        <button onClick={() => setEditing({})} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800"><PackagePlus size={18} /> Novo produto</button>
      </div>
      {productForm}
      <div className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2">
        {filters.map(([value, label]) => <button key={value} onClick={() => setFilter(value)} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${filter === value ? "bg-[#00BFFF] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>{label}</button>)}
      </div>
      {!products.length ? <EmptyState icon={PackagePlus} title="Seu catálogo começa aqui" description="Adicione a primeira atração com foto, preço e informações para seus clientes." action={() => setEditing({})} /> : !filteredProducts.length ? <EmptyState icon={PackagePlus} title="Nenhum produto neste filtro" description="Altere o filtro acima para ver os outros produtos." /> : <div className="mt-6 grid gap-4 xl:grid-cols-2">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} onEdit={setEditing} onToggle={onToggleProduct} onRemove={onRemoveProduct} />)}</div>}
    </section>
  );
}

function GallerySection({ gallery, onUpload, onUpdate, onRemove }) {
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#00BFFF]">Conteúdo do site</p>
          <h2 className="mt-2 text-2xl font-black tracking-[-.03em]">Galeria de fotos</h2>
          <p className="mt-2 text-sm text-slate-500">Mostre os melhores momentos e montagens dos seus eventos.</p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white"><ImagePlus size={18} /> Adicionar fotos<input multiple type="file" accept="image/*" onChange={onUpload} className="hidden" /></label>
      </div>
      {!gallery.length ? <EmptyState icon={Images} title="Sua galeria ainda está vazia" description="Envie fotos reais dos brinquedos e eventos para gerar confiança."><label className="mt-6 cursor-pointer rounded-xl bg-[#00BFFF] px-5 py-3 text-sm font-bold text-white">Enviar primeiras fotos<input multiple type="file" accept="image/*" onChange={onUpload} className="hidden" /></label></EmptyState> : <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{gallery.map((image) => <GalleryImageCard key={image.id} image={image} onUpdate={onUpdate} onRemove={onRemove} />)}</div>}
    </section>
  );
}

function SidebarLink({ href, icon: Icon, children, count, active = false, primary = false }: SidebarLinkProps) {
  return <Link to={href} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${active ? "bg-[#00BFFF] text-white shadow-[0_10px_20px_rgba(0,191,255,0.18)]" : primary ? "border border-cyan-300/20 bg-white/5 text-cyan-100 hover:bg-white/10" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><Icon size={18} /> {children}{count !== undefined && <span className={`ml-auto grid h-6 min-w-6 place-items-center rounded-lg px-1 text-xs ${active ? "bg-white/20" : "bg-white/10 text-white"}`}>{count}</span>}</Link>;
}

function formatMoney(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
}

function formatDate(value) {
  if (!value) return "Data a definir";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(new Date(`${value}T12:00:00`));
}

function getCustomer(reservation) {
  return Array.isArray(reservation.customers) ? reservation.customers[0] : reservation.customers;
}

function getProductNames(reservation) {
  return (reservation.appointment_items || []).map((item) => {
    const product = Array.isArray(item.products) ? item.products[0] : item.products;
    return `${item.quantity || 1}× ${product?.name || item.original_name}`;
  });
}

function CrmOverview({ reservations, pendingReviewCount, setTab }) {
  const [period, setPeriod] = useState("all");
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const nextWeekKey = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const periodReservations = reservations.filter((reservation) => (
    period === "all"
      || (period === "today" && reservation.event_date === todayKey)
      || (period === "week" && reservation.event_date >= todayKey && reservation.event_date <= nextWeekKey)
  ));
  const confirmed = periodReservations.filter((reservation) => reservation.status === "confirmed");
  const totalRevenue = confirmed.reduce((total, reservation) => total + Number(reservation.total_amount || 0), 0);
  const upcoming = confirmed.slice(0, 5);
  const customers = new Set(periodReservations.map((reservation) => getCustomer(reservation)?.id || getCustomer(reservation)?.phone).filter(Boolean));
  const periods = [["all", "Tudo"], ["today", "Hoje"], ["week", "Próximos 7 dias"]];

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#00BFFF]">Central operacional</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-.04em] sm:text-4xl">Controle sua operação com clareza.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-500">Visualize atendimentos, agenda e receita em um painel feito para a rotina da Monteiro.</p>
        </div>
        <Link to="/admin/agendamentos" className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"><MessageSquarePlus size={18} /> Importar mensagem</Link>
      </div>

      <section className="mt-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-50 text-[#00BFFF]"><CalendarRange size={20} /></span><div><p className="text-sm font-black">Visão por período</p><p className="mt-0.5 text-xs font-medium text-slate-500">Filtre os indicadores e eventos exibidos abaixo.</p></div></div>
        <div className="flex flex-wrap gap-2">{periods.map(([value, label]) => <button key={value} onClick={() => setPeriod(value)} className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${period === value ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}>{label}</button>)}</div>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl bg-gradient-to-br from-[#00BFFF] to-[#008fc0] p-5 text-white shadow-[0_14px_30px_rgba(0,191,255,0.2)]"><CalendarClock size={21} className="text-white/80" /><p className="mt-5 text-sm font-bold text-white/80">Reservas confirmadas</p><p className="mt-1 text-4xl font-black">{confirmed.length}</p><Link to="/admin/reservas" className="mt-4 inline-flex text-xs font-bold text-white underline-offset-4 hover:underline">Ver agenda →</Link></article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><ClipboardCheck size={21} className="text-amber-500" /><p className="mt-5 text-sm font-bold text-slate-500">Aguardando revisão</p><p className="mt-1 text-4xl font-black">{pendingReviewCount}</p><Link to="/admin/agendamentos/revisar" className="mt-4 inline-flex text-xs font-bold text-[#008fc0] hover:underline">Abrir fila →</Link></article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><CircleDollarSign size={21} className="text-emerald-500" /><p className="mt-5 text-sm font-bold text-slate-500">Receita prevista</p><p className="mt-1 text-2xl font-black">{formatMoney(totalRevenue)}</p><p className="mt-4 text-xs font-semibold text-slate-400">Reservas confirmadas</p></article>
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><Users size={21} className="text-violet-500" /><p className="mt-5 text-sm font-bold text-slate-500">Clientes atendidos</p><p className="mt-1 text-4xl font-black">{customers.size}</p><Link to="/admin/clientes" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#008fc0] hover:underline">Ver clientes <ArrowUpRight size={13} /></Link></article>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><div><h3 className="font-black">Próximas reservas</h3><p className="mt-1 text-sm text-slate-500">Eventos confirmados para organizar a operação.</p></div><Link to="/admin/reservas" className="text-sm font-bold text-[#008fc0] hover:underline">Ver todas</Link></div>
          {upcoming.length ? <div className="divide-y divide-slate-100">{upcoming.map((reservation) => { const customer = getCustomer(reservation); const products = getProductNames(reservation); return <article key={reservation.id} className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center"><div className="min-w-24"><p className="text-sm font-black text-[#008fc0]">{formatDate(reservation.event_date)}</p><p className="mt-1 text-xs font-bold text-slate-400">{reservation.start_time?.slice(0, 5) || "Horário a definir"}</p></div><div className="min-w-0 flex-1"><p className="font-black">{customer?.name || "Cliente não identificado"}</p><p className="mt-1 truncate text-sm text-slate-500">{reservation.address || "Endereço a definir"}{reservation.venue_type ? ` · ${reservation.venue_type}` : ""}</p><div className="mt-3 flex flex-wrap gap-2">{products.slice(0, 2).map((product) => <span key={product} className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-800">{product}</span>)}</div></div><p className="shrink-0 font-black">{formatMoney(reservation.total_amount)}</p></article>; })}</div> : <div className="px-6 py-14 text-center"><CalendarDays className="mx-auto text-[#00BFFF]" size={30} /><p className="mt-4 font-black">Nenhuma reserva confirmada</p><p className="mt-2 text-sm text-slate-500">Importe uma mensagem para iniciar o atendimento.</p></div>}
        </section>
        <aside className="rounded-3xl bg-slate-950 p-6 text-white"><p className="text-xs font-black uppercase tracking-[.18em] text-cyan-300">Próximas ações</p><h3 className="mt-3 text-2xl font-black leading-tight">O que demanda atenção hoje?</h3><p className="mt-3 text-sm leading-relaxed text-slate-300">Use estes atalhos para manter a operação organizada e o site atualizado.</p><div className="mt-6 space-y-3"><Link to="/admin/agendamentos" className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 transition hover:bg-white/15"><MessageSquarePlus size={19} className="text-cyan-300" /><span className="text-sm font-bold">Registrar novo atendimento</span></Link><Link to="/admin/agendamentos/revisar" className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 transition hover:bg-white/15"><ClipboardCheck size={19} className="text-cyan-300" /><span className="text-sm font-bold">Revisar {pendingReviewCount} mensagens</span></Link><button onClick={() => setTab("products")} className="flex w-full items-center gap-3 rounded-2xl bg-white/10 p-4 text-left transition hover:bg-white/15"><PackageCheck size={19} className="text-cyan-300" /><span className="text-sm font-bold">Atualizar catálogo</span></button></div></aside>
      </div>
    </section>
  );
}

export default function AdminDashboard({ products, gallery, reservations, pendingReviewCount, tab, setTab, setEditing, productForm, onSignOut, onToggleProduct, onRemoveProduct, onUploadGallery, onUpdateGallery, onRemoveGallery }) {
  const overviewTab = tab === "overview";
  const productsTab = tab === "products";
  const galleryTab = tab === "gallery";
  const activeProducts = products.filter((product) => product.active).length;
  const activeGallery = gallery.filter((image) => image.active).length;

  return (
    <main className="min-h-screen bg-[#f3f8fa] text-slate-900">
      <div className="min-h-screen lg:pl-72">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col overflow-y-auto bg-slate-950 px-5 py-7 text-white lg:flex">
          <Link to="/admin" className="flex items-center gap-3 px-3"><img src="/images/logo.jpg" alt="Monteiro Locações" className="h-11 w-11 rounded-2xl object-cover" /><div><p className="font-black leading-none">MONTEIRO</p><p className="mt-1 text-[10px] font-black tracking-[.2em] text-[#00BFFF]">LOCAÇÕES</p></div></Link>
          <p className="mt-12 px-3 text-[10px] font-black uppercase tracking-[.18em] text-slate-500">Central de gestão</p>
          <nav className="mt-3 space-y-1">
            <button onClick={() => setTab("overview")} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${overviewTab ? "bg-[#00BFFF] text-white shadow-[0_10px_20px_rgba(0,191,255,0.18)]" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><LayoutDashboard size={18} /> Visão geral</button>
            <button onClick={() => setTab("products")} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${productsTab ? "bg-[#00BFFF] text-white shadow-[0_10px_20px_rgba(0,191,255,0.18)]" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><LayoutDashboard size={18} /> Brinquedos e catálogo <span className={`ml-auto grid h-6 min-w-6 place-items-center rounded-lg px-1 text-xs ${productsTab ? "bg-white/20" : "bg-white/10 text-white"}`}>{products.length}</span></button>
            <button onClick={() => setTab("gallery")} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${galleryTab ? "bg-[#00BFFF] text-white shadow-[0_10px_20px_rgba(0,191,255,0.18)]" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><Images size={18} /> Galeria <span className={`ml-auto grid h-6 min-w-6 place-items-center rounded-lg px-1 text-xs ${galleryTab ? "bg-white/20" : "bg-white/10 text-white"}`}>{gallery.length}</span></button>
          </nav>
          <p className="mt-9 px-3 text-[10px] font-black uppercase tracking-[.18em] text-slate-500">Operação diária</p>
          <nav className="mt-3 space-y-1">
            <SidebarLink href="/admin/reservas" icon={CalendarDays} count={reservations.length}>Reservas</SidebarLink>
            <SidebarLink href="/admin/disponibilidade" icon={CalendarRange}>Disponibilidade</SidebarLink>
            <SidebarLink href="/admin/agendamentos/revisar" icon={ClipboardCheck} count={pendingReviewCount}>Revisar mensagens</SidebarLink>
            <SidebarLink href="/admin/agendamentos" icon={MessageSquarePlus} primary>Importar mensagem</SidebarLink>
          </nav>
          <p className="mt-9 px-3 text-[10px] font-black uppercase tracking-[.18em] text-slate-500">Comercial e financeiro</p>
          <nav className="mt-3 space-y-1">
            <SidebarLink href="/admin/clientes" icon={Users}>Clientes</SidebarLink>
            <SidebarLink href="/admin/orcamentos" icon={FileText}>Orçamentos</SidebarLink>
            <SidebarLink href="/admin/financeiro" icon={WalletCards}>Financeiro</SidebarLink>
            <SidebarLink href="/admin/contratos" icon={FileCheck2}>Contratos</SidebarLink>
            <SidebarLink href="/admin/recibos" icon={ReceiptText}>Recibos</SidebarLink>
          </nav>
          <p className="mt-9 px-3 text-[10px] font-black uppercase tracking-[.18em] text-slate-500">Gestão</p>
          <nav className="mt-3 space-y-1">
            <SidebarLink href="/admin/estatisticas" icon={BarChart3}>Estatísticas</SidebarLink>
            <SidebarLink href="/admin/empresa" icon={Building2}>Empresa</SidebarLink>
          </nav>
          <div className="mt-auto space-y-3 border-t border-white/10 pt-5">
            <div className="rounded-2xl bg-white/5 px-4 py-3"><p className="text-xs font-bold text-slate-400">Gestão Monteiro</p><p className="mt-1 text-sm font-black">Painel administrativo</p></div>
            <a href="/" className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"><ExternalLink size={17} /> Ver site público</a>
            <button onClick={onSignOut} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-300 transition hover:bg-rose-500/10 hover:text-rose-300"><LogOut size={17} /> Sair do painel</button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 lg:hidden"><img src="/images/logo.jpg" alt="Monteiro Locações" className="h-11 w-11 rounded-2xl object-cover" /><p className="font-black">MONTEIRO<br /><span className="text-xs tracking-[.18em] text-[#00BFFF]">LOCAÇÕES</span></p></div>
            <div className="hidden lg:block"><p className="text-xs font-black uppercase tracking-[.2em] text-[#00BFFF]">Painel administrativo</p><h1 className="mt-2 text-3xl font-black tracking-[-.04em]">Organize o site e a agenda</h1></div>
            <div className="flex items-center gap-2"><a href="/" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold"><ExternalLink size={16} /> <span className="hidden sm:inline">Ver site</span></a><button onClick={onSignOut} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"><LogOut size={16} /> <span className="hidden sm:inline">Sair</span></button></div>
          </header>

          <div className="mt-7 grid gap-2 sm:grid-cols-2 lg:hidden">
            <button onClick={() => setTab("overview")} className={`rounded-2xl px-4 py-3 text-sm font-bold ${overviewTab ? "bg-[#00BFFF] text-white" : "bg-white text-slate-600"}`}>Visão geral</button>
            <button onClick={() => setTab("products")} className={`rounded-2xl px-4 py-3 text-sm font-bold ${productsTab ? "bg-[#00BFFF] text-white" : "bg-white text-slate-600"}`}>Catálogo ({products.length})</button>
            <button onClick={() => setTab("gallery")} className={`rounded-2xl px-4 py-3 text-sm font-bold ${galleryTab ? "bg-[#00BFFF] text-white" : "bg-white text-slate-600"}`}>Galeria ({gallery.length})</button>
            <Link to="/admin/reservas" className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-bold text-slate-600">Reservas</Link>
            <Link to="/admin/agendamentos" className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white">Importar mensagem</Link>
          </div>

          {!overviewTab && (<section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article className="rounded-3xl bg-gradient-to-br from-[#00BFFF] to-[#008fc0] p-6 text-white shadow-[0_14px_30px_rgba(0,191,255,0.2)]"><p className="text-sm font-bold text-white/80">Produtos publicados</p><p className="mt-3 text-4xl font-black">{activeProducts}<span className="ml-1 text-lg text-white/70">de {products.length}</span></p><p className="mt-5 text-xs font-semibold text-white/80">Itens ativos aparecem no catálogo público.</p></article>
            <article className="rounded-3xl border border-slate-200 bg-white p-6"><p className="text-sm font-bold text-slate-500">Fotos publicadas</p><p className="mt-3 text-4xl font-black text-slate-900">{activeGallery}<span className="ml-1 text-lg text-slate-400">de {gallery.length}</span></p><p className="mt-5 text-xs font-semibold text-slate-400">A galeria ajuda o cliente a confiar na montagem.</p></article>
            <Link to="/admin/agendamentos" className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg"><span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-[#00BFFF]"><CalendarDays size={20} /></span><p className="mt-4 font-black">Nova reserva</p><p className="mt-2 text-sm leading-relaxed text-slate-500">Importe a mensagem recebida e confirme o agendamento em poucos passos.</p><span className="mt-4 inline-flex text-sm font-bold text-[#008fc0]">Abrir agenda →</span></Link>
          </section>)}

          {overviewTab ? <CrmOverview reservations={reservations} pendingReviewCount={pendingReviewCount} setTab={setTab} /> : productsTab ? <ProductCatalog products={products} productForm={productForm} setEditing={setEditing} onToggleProduct={onToggleProduct} onRemoveProduct={onRemoveProduct} /> : <GallerySection gallery={gallery} onUpload={onUploadGallery} onUpdate={onUpdateGallery} onRemove={onRemoveGallery} />}
        </div>
      </div>
    </main>
  );
}
