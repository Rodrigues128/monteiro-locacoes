import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Ban,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  LoaderCircle,
  MapPin,
  Phone,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase";
import { adminSupabase as supabase } from "@/lib/adminApi";
import AdminWorkspace from "@/components/admin/AdminWorkspace";
import { Link } from "react-router-dom";

/** @typedef {{ name?: string, document_number?: string, phone?: string }} Customer */
/** @typedef {{ original_name: string, quantity: number, products?: { name?: string } | { name?: string }[] }} ReservationItem */
/** @typedef {{ id: string, event_date: string, start_time?: string | null, end_time?: string | null, address?: string | null, venue_type?: string | null, total_amount?: number | null, status: string, customers?: Customer | Customer[], appointment_items?: ReservationItem[] }} Reservation */

const statusLabels = {
  confirmed: "Confirmada",
  completed: "Concluída",
  cancelled: "Cancelada",
  draft: "Rascunho",
};

const statusClasses = {
  confirmed: "bg-cyan-100 text-cyan-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
  draft: "bg-slate-100 text-slate-600",
};

/** @param {string | null | undefined} value */
function formatTime(value) {
  return value ? value.slice(0, 5) : "A definir";
}

/** @param {number | null | undefined} value */
function formatMoney(value) {
  return value === null || value === undefined
    ? "A combinar"
    : new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
}

/** @param {Reservation} reservation */
function getCustomer(reservation) {
  return Array.isArray(reservation.customers)
    ? reservation.customers[0]
    : reservation.customers;
}

/** @param {ReservationItem} item */
function getItemName(item) {
  const product = Array.isArray(item.products)
    ? item.products[0]
    : item.products;
  return product?.name || item.original_name;
}

function StatusConfirmationModal({ action, busy, onCancel, onConfirm }) {
  if (!action) return null;

  const customer = getCustomer(action.reservation);
  const completing = action.status === "completed";
  const Icon = completing ? CheckCircle2 : Ban;
  const title = completing
    ? "Concluir esta reserva?"
    : "Cancelar esta reserva?";
  const description = completing
    ? "O evento será marcado como concluído e continuará disponível no histórico."
    : "A reserva será cancelada e deixará de aparecer como um evento confirmado.";

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/55 p-5 backdrop-blur-sm"
      onClick={busy ? undefined : onCancel}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-status-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-2xl"
      >
        <div
          className={`px-6 py-7 text-white sm:px-8 ${completing ? "bg-gradient-to-br from-emerald-500 to-emerald-700" : "bg-gradient-to-br from-rose-500 to-rose-700"}`}
        >
          <div className="flex items-start justify-between gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20">
              <Icon size={24} />
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={onCancel}
              className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 transition hover:bg-white/25 disabled:opacity-50"
              aria-label="Fechar confirmação"
            >
              <X size={18} />
            </button>
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[.18em] text-white/75">
            Atualizar reserva
          </p>
          <h2
            id="reservation-status-title"
            className="mt-2 text-3xl font-black tracking-[-.04em]"
          >
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/85">
            {description}
          </p>
        </div>
        <div className="space-y-5 p-6 sm:p-8">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
              Reserva de
            </p>
            <p className="mt-1 font-black text-slate-900">
              {customer?.name || "Cliente não identificado"}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              {new Intl.DateTimeFormat("pt-BR").format(
                new Date(`${action.reservation.event_date}T12:00:00`),
              )}{" "}
              · {action.reservation.appointment_items?.length || 0} produtos
            </p>
          </div>
          {!completing && (
            <div className="flex gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm leading-relaxed text-rose-800">
              <TriangleAlert className="mt-0.5 shrink-0" size={18} /> Esta ação
              altera o status da reserva. Você poderá consultá-la no histórico
              depois.
            </div>
          )}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={busy}
              onClick={onCancel}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={onConfirm}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition disabled:opacity-60 ${completing ? "bg-slate-950 hover:bg-slate-800" : "bg-rose-600 hover:bg-rose-700"}`}
            >
              {busy ? (
                <LoaderCircle className="animate-spin" size={17} />
              ) : (
                <Icon size={17} />
              )}
              {busy
                ? "Atualizando..."
                : completing
                  ? "Concluir reserva"
                  : "Cancelar reserva"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Reservations() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const [reservations, setReservations] = useState(
    /** @type {Reservation[]} */ [],
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [statusBusy, setStatusBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setNotice("");
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          "id, event_date, start_time, end_time, address, venue_type, total_amount, status, customers(name, document_number, phone), appointment_items(quantity, original_name, products(name))",
        )
        .order("event_date", { ascending: true });
      if (error) throw error;
      setReservations(/** @type {Reservation[]} */ data || []);
    } catch (error) {
      setNotice(`Não foi possível carregar as reservas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) =>
      setSession(next),
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || !supabase) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data }) => setIsAdmin(Boolean(data)));
  }, [session]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const filteredReservations = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return reservations.filter((reservation) => {
      const customer = getCustomer(reservation);
      const matchesStatus =
        statusFilter === "all" || reservation.status === statusFilter;
      const haystack = [
        customer?.name,
        customer?.phone,
        reservation.address,
        reservation.venue_type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("pt-BR");
      return (
        matchesStatus &&
        (!normalizedQuery || haystack.includes(normalizedQuery))
      );
    });
  }, [query, reservations, statusFilter]);

  const performStatusUpdate = async (reservation, status) => {
    const label = statusLabels[status] || status;
    setStatusBusy(true);
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status })
        .eq("id", reservation.id);
      if (error) throw error;
      setNotice(`Reserva marcada como ${label.toLocaleLowerCase("pt-BR")}.`);
      load();
    } catch (error) {
      setNotice(`Não foi possível atualizar o status: ${error.message}`);
    } finally {
      setStatusBusy(false);
      setPendingAction(null);
    }
  };

  if (!isSupabaseConfigured)
    return (
      <main className="grid min-h-screen place-items-center p-5">
        Configure o Supabase para usar as reservas.
      </main>
    );
  if (!session)
    return (
      <main className="grid min-h-screen place-items-center p-5">
        <Link
          to="/admin"
          className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white"
        >
          Entre no painel administrativo primeiro
        </Link>
      </main>
    );
  if (isAdmin === null)
    return (
      <main className="grid min-h-screen place-items-center">
        Verificando permissões...
      </main>
    );
  if (!isAdmin)
    return (
      <main className="grid min-h-screen place-items-center p-5">
        Acesso restrito a administradores.
      </main>
    );

  return (
    <AdminWorkspace>
      <div className="mx-auto max-w-7xl">
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#008fc0]"
          >
            <ArrowLeft size={16} /> Voltar ao painel
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/agendamentos/revisar"
              className="text-sm font-bold text-[#008fc0]"
            >
              Revisar mensagens
            </Link>
            <Link
              to="/admin/agendamentos"
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"
            >
              Importar mensagem
            </Link>
          </div>
        </div>

        <header className="mt-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#00BFFF]">
              Agenda interna
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-[-.04em]">
              Reservas
            </h1>
            <p className="mt-3 max-w-2xl leading-relaxed text-slate-500">
              Acompanhe as reservas confirmadas e mantenha o status do evento
              atualizado.
            </p>
          </div>
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Confirmadas
            </p>
            <p className="mt-1 text-2xl font-black">
              {
                reservations.filter(
                  (reservation) => reservation.status === "confirmed",
                ).length
              }
            </p>
          </div>
        </header>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <label className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por cliente, telefone ou endereço"
                className="w-full rounded-2xl bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-cyan-200"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                ["all", "Todas"],
                ["confirmed", "Confirmadas"],
                ["completed", "Concluídas"],
                ["cancelled", "Canceladas"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition ${statusFilter === value ? "bg-[#00BFFF] text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {notice && (
          <p className="mt-5 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
            {notice}
          </p>
        )}

        {loading ? (
          <div className="mt-8 grid min-h-64 place-items-center rounded-3xl bg-white">
            <LoaderCircle className="animate-spin text-[#00BFFF]" size={28} />
          </div>
        ) : !filteredReservations.length ? (
          <section className="mt-8 grid min-h-80 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <div>
              <ClipboardList className="mx-auto text-[#00BFFF]" size={34} />
              <h2 className="mt-4 text-xl font-black">
                Nenhuma reserva encontrada
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                Importe uma mensagem, revise os dados e confirme a primeira
                reserva.
              </p>
            </div>
          </section>
        ) : (
          <div className="mt-8 space-y-4">
            {filteredReservations.map((reservation) => {
              const customer = getCustomer(reservation);
              const canComplete = reservation.status === "confirmed";
              return (
                <article
                  key={reservation.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                    <div className="min-w-52 xl:w-56">
                      <div className="flex items-center gap-2 text-[#008fc0]">
                        <CalendarDays size={18} />
                        <span className="text-sm font-black">
                          {new Intl.DateTimeFormat("pt-BR").format(
                            new Date(`${reservation.event_date}T12:00:00`),
                          )}
                        </span>
                      </div>
                      <p className="mt-2 font-bold text-slate-800">
                        {formatTime(reservation.start_time)}
                        {reservation.end_time
                          ? ` às ${formatTime(reservation.end_time)}`
                          : ""}
                      </p>
                      <span
                        className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ${statusClasses[reservation.status] || statusClasses.draft}`}
                      >
                        {statusLabels[reservation.status] || reservation.status}
                      </span>
                    </div>
                    <div className="min-w-52 xl:w-64">
                      <h2 className="font-black text-slate-900">
                        {customer?.name || "Cliente não identificado"}
                      </h2>
                      {customer?.phone && (
                        <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          <Phone size={15} /> {customer.phone}
                        </p>
                      )}
                      {customer?.document_number && (
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          CPF/CNPJ: {customer.document_number}
                        </p>
                      )}
                    </div>
                    <div className="min-w-52 flex-1">
                      <p className="flex items-start gap-2 text-sm font-semibold text-slate-600">
                        <MapPin
                          className="mt-0.5 shrink-0 text-[#00BFFF]"
                          size={16}
                        />{" "}
                        <span>
                          {reservation.address || "Endereço não informado"}
                          {reservation.venue_type
                            ? ` · ${reservation.venue_type}`
                            : ""}
                        </span>
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(reservation.appointment_items || []).map(
                          (item, index) => (
                            <span
                              key={`${item.original_name}-${index}`}
                              className="rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-800"
                            >
                              {item.quantity}× {getItemName(item)}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 xl:block xl:text-right">
                      <p className="text-lg font-black">
                        {formatMoney(reservation.total_amount)}
                      </p>
                      {canComplete && (
                        <button
                          onClick={() =>
                            setPendingAction({
                              reservation,
                              status: "completed",
                            })
                          }
                          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"
                        >
                          <CheckCircle2 size={15} /> Concluir
                        </button>
                      )}
                      {reservation.status === "confirmed" && (
                        <button
                          onClick={() =>
                            setPendingAction({
                              reservation,
                              status: "cancelled",
                            })
                          }
                          className="mt-3 block text-xs font-bold text-rose-600"
                        >
                          Cancelar reserva
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <StatusConfirmationModal
        action={pendingAction}
        busy={statusBusy}
        onCancel={() => setPendingAction(null)}
        onConfirm={() =>
          performStatusUpdate(pendingAction.reservation, pendingAction.status)
        }
      />
    </AdminWorkspace>
  );
}
