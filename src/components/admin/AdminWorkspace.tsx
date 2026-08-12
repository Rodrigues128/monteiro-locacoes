import { type ReactNode, useEffect, useState } from "react";
import {
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardCheck,
  ExternalLink,
  FileCheck2,
  FileText,
  Images,
  LayoutDashboard,
  MessageSquarePlus,
  ReceiptText,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type AdminWorkspaceProps = {
  children: ReactNode;
};

type CounterKey = "products" | "gallery" | "reservations" | "reviews";
type NavigationItem = { href: string; label: string; icon: LucideIcon; exact?: boolean; tab?: string; countKey?: CounterKey };
type NavigationCounts = Record<CounterKey, number>;

const contentItems: NavigationItem[] = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/admin?tab=products", label: "Brinquedos e catálogo", icon: LayoutDashboard, tab: "products", countKey: "products" },
  { href: "/admin?tab=gallery", label: "Galeria", icon: Images, tab: "gallery", countKey: "gallery" },
];

const scheduleItems: NavigationItem[] = [
  { href: "/admin/reservas", label: "Reservas", icon: CalendarDays, exact: true, countKey: "reservations" },
  { href: "/admin/disponibilidade", label: "Disponibilidade", icon: CalendarDays, exact: true },
  { href: "/admin/agendamentos/revisar", label: "Revisar mensagens", icon: ClipboardCheck, exact: true, countKey: "reviews" },
  { href: "/admin/agendamentos", label: "Importar mensagem", icon: MessageSquarePlus, exact: true },
];

const commercialItems: NavigationItem[] = [
  { href: "/admin/clientes", label: "Clientes", icon: Users, exact: true },
  { href: "/admin/orcamentos", label: "Orçamentos", icon: FileText, exact: true },
  { href: "/admin/financeiro", label: "Financeiro", icon: WalletCards, exact: true },
  { href: "/admin/contratos", label: "Contratos", icon: FileCheck2, exact: true },
  { href: "/admin/recibos", label: "Recibos", icon: ReceiptText, exact: true },
];

const managementItems: NavigationItem[] = [
  { href: "/admin/estatisticas", label: "Estatísticas", icon: BarChart3, exact: true },
  { href: "/admin/empresa", label: "Empresa", icon: Building2, exact: true },
];

function NavigationLinks({ items, counts, compact = false }: { items: NavigationItem[]; counts: NavigationCounts; compact?: boolean }) {
  const { pathname, search } = useLocation();
  const tab = new URLSearchParams(search).get("tab");

  return items.map((item) => {
    const Icon = item.icon;
    const active = item.tab
      ? pathname === "/admin" && tab === item.tab
      : item.exact && pathname === item.href && (item.href !== "/admin" || !tab);
    const count = item.countKey ? counts[item.countKey] : undefined;

    return (
      <Link
        key={item.href}
        to={item.href}
        aria-current={active ? "page" : undefined}
        className={`inline-flex items-center gap-3 rounded-2xl font-bold transition ${compact ? "shrink-0 px-3 py-2.5 text-sm" : "w-full px-4 py-3 text-sm"} ${active ? "bg-[#00BFFF] text-white shadow-[0_12px_24px_rgba(0,191,255,0.22)]" : compact ? "text-slate-500 hover:bg-slate-50 hover:text-slate-900" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
      >
        <Icon size={compact ? 16 : 18} />
        {item.label}
        {count !== undefined && !compact && <span className={`ml-auto grid h-6 min-w-6 place-items-center rounded-lg px-1 text-xs ${active ? "bg-white/20 text-white" : "bg-white/10 text-white"}`}>{count}</span>}
      </Link>
    );
  });
}

export default function AdminWorkspace({ children }: AdminWorkspaceProps) {
  const [counts, setCounts] = useState<NavigationCounts>({ products: 0, gallery: 0, reservations: 0, reviews: 0 });

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;

    const loadCounts = async () => {
      const [products, gallery, reservations, reviews] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("gallery_images").select("id", { count: "exact", head: true }),
        supabase.from("appointments").select("id", { count: "exact", head: true }).in("status", ["confirmed", "completed"]),
        supabase.from("appointment_messages").select("id", { count: "exact", head: true }).in("status", ["pending_review", "ready_to_confirm"]),
      ]);

      if (!active || products.error || gallery.error || reservations.error || reviews.error) return;
      setCounts({ products: products.count || 0, gallery: gallery.count || 0, reservations: reservations.count || 0, reviews: reviews.count || 0 });
    };

    loadCounts();
    return () => { active = false; };
  }, []);

  return (
    <main className="min-h-screen bg-[#f3f8fa] text-slate-900">
      <div className="min-h-screen lg:pl-72">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col overflow-y-auto bg-slate-950 px-5 py-7 text-white lg:flex">
          <Link to="/admin" className="flex items-center gap-3 px-3">
            <img src="/images/logo.jpg" alt="Monteiro Locações" className="h-11 w-11 rounded-2xl object-cover" />
            <div>
              <p className="font-black leading-none">MONTEIRO</p>
              <p className="mt-1 text-[10px] font-black tracking-[.2em] text-cyan-300">LOCAÇÕES</p>
            </div>
          </Link>

          <p className="mt-12 px-3 text-[10px] font-black uppercase tracking-[.18em] text-slate-500">Central de gestão</p>
          <nav aria-label="Navegação administrativa" className="mt-3 space-y-1">
            <NavigationLinks items={contentItems} counts={counts} />
          </nav>

          <p className="mt-9 px-3 text-[10px] font-black uppercase tracking-[.18em] text-slate-500">Operação diária</p>
          <nav aria-label="Navegação da agenda" className="mt-3 space-y-1">
            <NavigationLinks items={scheduleItems} counts={counts} />
          </nav>

          <p className="mt-9 px-3 text-[10px] font-black uppercase tracking-[.18em] text-slate-500">Comercial e financeiro</p>
          <nav aria-label="Navegação comercial" className="mt-3 space-y-1">
            <NavigationLinks items={commercialItems} counts={counts} />
          </nav>

          <p className="mt-9 px-3 text-[10px] font-black uppercase tracking-[.18em] text-slate-500">Gestão</p>
          <nav aria-label="Navegação de gestão" className="mt-3 space-y-1">
            <NavigationLinks items={managementItems} counts={counts} />
          </nav>

          <div className="mt-auto space-y-4 border-t border-white/10 pt-5">
            <div className="rounded-2xl bg-white/5 px-4 py-3">
              <p className="text-xs font-bold text-slate-400">Gestão Monteiro</p>
              <p className="mt-1 text-sm font-black">Painel administrativo</p>
            </div>
            <a href="/" className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15">
              <ExternalLink size={17} /> Ver site público
            </a>
          </div>
        </aside>

        <div className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
          <header className="flex items-center gap-3 lg:hidden">
            <img src="/images/logo.jpg" alt="Monteiro Locações" className="h-11 w-11 rounded-2xl object-cover" />
            <div>
              <p className="font-black leading-none">MONTEIRO</p>
              <p className="mt-1 text-[10px] font-black tracking-[.2em] text-[#00BFFF]">LOCAÇÕES</p>
            </div>
          </header>
          <nav aria-label="Navegação administrativa" className="mt-6 flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm lg:hidden">
            <NavigationLinks items={[...contentItems, ...scheduleItems, ...commercialItems, ...managementItems]} counts={counts} compact />
          </nav>
          {children}
        </div>
      </div>
    </main>
  );
}
