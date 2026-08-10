import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarCheck2,
  ClipboardList,
  LoaderCircle,
  Save,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { reviewIssues, suggestProduct } from "@/lib/appointmentMatching";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

/** @typedef {{ id: string, name: string, active: boolean }} Product */
/** @typedef {{ product_id: string, normalized_alias: string }} ProductAlias */
/** @typedef {{ name?: string, document_number?: string, phone?: string }} ClientData */
/** @typedef {{ date?: string, start_time?: string, end_time?: string, address?: string, venue_type?: string }} EventData */
/** @typedef {{ client?: ClientData, event?: EventData, total_amount?: number | null }} AppointmentDraft */
/** @typedef {{ id: string, original_name: string, product_id: string | null, match_type: string, confidence: number | null, needs_review: boolean, quantity?: number }} MessageItem */
/** @typedef {{ id: string, status: string, original_text: string, extracted_data: AppointmentDraft, appointment_message_items: MessageItem[] }} AppointmentMessage */

type FieldProps = {
  label: string;
  value: string | number | null | undefined;
  onChange: (value: string) => void;
  type?: string;
  min?: number;
};

function Field({ label, value, onChange, type = "text", min }: FieldProps) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label}
      <input
        type={type}
        min={min}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-medium outline-none transition focus:border-[#00BFFF] focus:bg-white"
      />
    </label>
  );
}

/** @typedef {{ messages: AppointmentMessage[], selectedId?: string, onSelect: (message: AppointmentMessage) => void }} MessageListProps */
function MessageList(/** @type {MessageListProps} */ { messages, selectedId, onSelect }) {
  return (
    <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <h2 className="font-black">Fila de revisão</h2>
        <p className="mt-1 text-sm text-slate-500">
          {messages.length} mensagem(ns) aguardando.
        </p>
      </div>
      <div className="max-h-[660px] overflow-auto">
        {messages.length ? (
          messages.map((message) => {
            const data = message.extracted_data || {};
            const ready = message.status === "ready_to_confirm";
            return (
              <button
                key={message.id}
                onClick={() => onSelect(message)}
                className={`block w-full border-b border-slate-100 p-5 text-left transition ${
                  message.id === selectedId ? "bg-cyan-50" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-black">
                    {data.client?.name || "Cliente não identificado"}
                  </p>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-black ${ready ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {ready ? "PRONTO" : "REVISAR"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {data.event?.date || "Sem data"} · {data.event?.venue_type || "Local não informado"}
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
                  {message.original_text}
                </p>
              </button>
            );
          })
        ) : (
          <p className="p-8 text-center text-sm text-slate-500">Nenhuma mensagem na fila.</p>
        )}
      </div>
    </aside>
  );
}

/** @typedef {{ message: AppointmentMessage, products: Product[], aliases: ProductAlias[], onSaved: () => void, onConfirmed: () => void }} EditorProps */
function Editor(/** @type {EditorProps} */ { message, products, aliases, onSaved, onConfirmed }) {
  const [draft, setDraft] = useState(/** @type {AppointmentDraft} */ (message.extracted_data || {}));
  const [items, setItems] = useState(/** @type {MessageItem[]} */ (message.appointment_message_items || []));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setDraft(message.extracted_data || {});
    setItems(message.appointment_message_items || []);
    setNotice("");
  }, [message]);

  const issues = useMemo(() => reviewIssues(draft, items), [draft, items]);

  const change = (group, field, value) => {
    setDraft((current) => ({
      ...current,
      [group]: { ...current[group], [field]: value },
    }));
  };

  const changeItem = (id, productId) => {
    setItems((current) => current.map((item) => (
      item.id === id
        ? {
            ...item,
            product_id: productId || null,
            match_type: productId ? "manual" : "unidentified",
            confidence: productId ? 1 : null,
            needs_review: !productId,
          }
        : item
    )));
  };

  const changeQuantity = (id, value) => {
    const quantity = Math.max(1, Math.floor(Number(value) || 1));
    setItems((current) => current.map((item) => (
      item.id === id ? { ...item, quantity } : item
    )));
  };

  const suggest = () => {
    setItems((current) => current.map((item) => {
      if (item.product_id) return item;
      const suggestion = suggestProduct(item.original_name, products, aliases);
      return { ...item, ...suggestion, needs_review: !suggestion.product_id };
    }));
  };

  const persistReview = async () => {
    const nextIssues = reviewIssues(draft, items);
    const status = nextIssues.length ? "pending_review" : "ready_to_confirm";
    const { error } = await supabase
      .from("appointment_messages")
      .update({ extracted_data: draft, validation_issues: nextIssues, status })
      .eq("id", message.id);
    if (error) throw error;

    const updates = await Promise.all(items.map((item) => supabase
      .from("appointment_message_items")
      .update({
        product_id: item.product_id,
        quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
        match_type: item.match_type,
        confidence: item.confidence,
        needs_review: !item.product_id,
      })
      .eq("id", item.id)));
    const failedUpdate = updates.find((result) => result.error);
    if (failedUpdate?.error) throw failedUpdate.error;
    return { nextIssues, status };
  };

  const save = async () => {
    setBusy(true);
    setNotice("");
    try {
      const { status } = await persistReview();
      setNotice(status === "ready_to_confirm" ? "Revisão salva. A reserva está pronta para confirmação." : "Revisão salva. Complete os campos pendentes para prosseguir.");
      onSaved();
    } catch (error) {
      setNotice(`Não foi possível salvar: ${error.message}`);
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    if (!window.confirm("Confirmar esta reserva? O cliente e os itens serão registrados no painel.")) return;
    setBusy(true);
    setNotice("");
    try {
      const { nextIssues } = await persistReview();
      if (nextIssues.length) {
        setNotice("Corrija as pendências antes de confirmar a reserva.");
        return;
      }
      const { data, error } = await supabase.rpc("confirm_appointment_message", {
        p_message_id: message.id,
      });
      if (error) throw error;
      setNotice(`Reserva confirmada com sucesso (#${data}).`);
      onConfirmed();
    } catch (error) {
      setNotice(`Não foi possível confirmar: ${error.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#00BFFF]">Revisão manual</p>
          <h2 className="mt-2 text-2xl font-black">Dados do agendamento</h2>
        </div>
        <button onClick={suggest} className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-bold text-[#008fc0]">
          <Sparkles size={16} /> Sugerir vínculos
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Nome do cliente" value={draft.client?.name} onChange={(value) => change("client", "name", value)} />
        <Field label="CPF/CNPJ" value={draft.client?.document_number} onChange={(value) => change("client", "document_number", value.replace(/\D/g, ""))} />
        <Field label="Telefone" value={draft.client?.phone} onChange={(value) => change("client", "phone", value.replace(/\D/g, ""))} />
        <Field label="Data do evento" type="date" value={draft.event?.date} onChange={(value) => change("event", "date", value)} />
        <Field label="Horário inicial" type="time" value={draft.event?.start_time} onChange={(value) => change("event", "start_time", value)} />
        <Field label="Horário final" type="time" value={draft.event?.end_time} onChange={(value) => change("event", "end_time", value)} />
        <Field label="Endereço" value={draft.event?.address} onChange={(value) => change("event", "address", value)} />
        <Field label="Local do evento" value={draft.event?.venue_type} onChange={(value) => change("event", "venue_type", value)} />
        <Field label="Valor total" type="number" min={0} value={draft.total_amount} onChange={(value) => setDraft((current) => ({ ...current, total_amount: value === "" ? null : Number(value) }))} />
      </div>

      <div className="mt-8 border-t border-slate-100 pt-6">
        <h3 className="font-black">Serviços da mensagem</h3>
        <p className="mt-1 text-sm text-slate-500">Vincule cada serviço a um produto e informe a quantidade.</p>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-[1fr_110px_1.2fr]">
              <div>
                <p className="font-bold text-slate-800">{item.original_name}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {item.match_type === "alias" ? "Apelido reconhecido" : item.match_type === "normalized" ? "Nome reconhecido" : "Revisão manual"}
                </p>
              </div>
              <Field label="Quantidade" type="number" min={1} value={item.quantity || 1} onChange={(value) => changeQuantity(item.id, value)} />
              <label className="block text-sm font-bold text-slate-700">Produto
                <select value={item.product_id || ""} onChange={(event) => changeItem(item.id, event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#00BFFF]">
                  <option value="">Escolha um produto</option>
                  {products.map((product) => <option key={product.id} value={product.id}>{product.name}{product.active ? "" : " (inativo)"}</option>)}
                </select>
              </label>
            </div>
          ))}
        </div>
      </div>

      {issues.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="flex items-center gap-2 font-bold text-amber-800"><TriangleAlert size={18} /> Pendências para confirmação</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
            {issues.map((issue, index) => <li key={`${issue.field}-${index}`}>{issue.message}</li>)}
          </ul>
        </div>
      )}

      <details className="mt-6 rounded-2xl bg-slate-50 p-4">
        <summary className="cursor-pointer font-bold text-slate-700">Ver mensagem original</summary>
        <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-600">{message.original_text}</pre>
      </details>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button disabled={busy} onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">
          {busy ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />} Salvar revisão
        </button>
        <button disabled={busy || issues.length > 0} onClick={confirm} className="inline-flex items-center gap-2 rounded-xl bg-[#00BFFF] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
          <CalendarCheck2 size={17} /> Confirmar reserva
        </button>
        {notice && <p className="text-sm font-semibold text-slate-600">{notice}</p>}
      </div>
    </section>
  );
}

export default function AppointmentReview() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const [messages, setMessages] = useState(/** @type {AppointmentMessage[]} */ ([]));
  const [products, setProducts] = useState(/** @type {Product[]} */ ([]));
  const [aliases, setAliases] = useState(/** @type {ProductAlias[]} */ ([]));
  const [selected, setSelected] = useState(/** @type {AppointmentMessage | null} */ (null));
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [messagesResult, productsResult, aliasesResult] = await Promise.all([
        supabase.from("appointment_messages").select("*, appointment_message_items(*)").in("status", ["pending_review", "ready_to_confirm"]).order("received_at", { ascending: false }),
        supabase.from("products").select("id, name, active").order("name"),
        supabase.from("product_aliases").select("product_id, normalized_alias"),
      ]);
      if (messagesResult.error) throw messagesResult.error;
      if (productsResult.error) throw productsResult.error;
      if (aliasesResult.error) throw aliasesResult.error;
      const nextMessages = /** @type {AppointmentMessage[]} */ (messagesResult.data || []);
      setMessages(nextMessages);
      setProducts(/** @type {Product[]} */ (productsResult.data || []));
      setAliases(/** @type {ProductAlias[]} */ (aliasesResult.data || []));
      setSelected((current) => nextMessages.find((message) => message.id === current?.id) || nextMessages[0] || null);
    } catch (loadError) {
      setError(`Não foi possível carregar a fila: ${loadError.message}`);
    }
  };

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || !supabase) {
      setIsAdmin(false);
      return;
    }
    supabase.from("admin_users").select("user_id").eq("user_id", session.user.id).maybeSingle().then(({ data }) => setIsAdmin(Boolean(data)));
  }, [session]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  if (!isSupabaseConfigured) return <main className="grid min-h-screen place-items-center p-5">Configure o Supabase para usar a fila.</main>;
  if (!session) return <main className="grid min-h-screen place-items-center p-5"><a href="/admin" className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">Entre no painel administrativo primeiro</a></main>;
  if (isAdmin === null) return <main className="grid min-h-screen place-items-center">Verificando permissões...</main>;
  if (!isAdmin) return <main className="grid min-h-screen place-items-center p-5">Acesso restrito a administradores.</main>;

  return (
    <main className="min-h-screen bg-[#f3f8fa] px-5 py-8 text-slate-900 sm:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <a href="/admin/agendamentos" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#008fc0]"><ArrowLeft size={16} /> Importar outra mensagem</a>
          <a href="/admin/reservas" className="text-sm font-bold text-[#008fc0]">Ver reservas confirmadas →</a>
        </div>
        <header className="mt-8">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#00BFFF]">Agendamentos</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-.04em]">Revisar mensagens</h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-slate-500">Corrija os dados, vincule os produtos e confirme apenas quando a reserva estiver pronta.</p>
        </header>
        {error ? <p className="mt-8 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p> : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
            <MessageList messages={messages} selectedId={selected?.id} onSelect={setSelected} />
            {selected ? <Editor message={selected} products={products} aliases={aliases} onSaved={load} onConfirmed={load} /> : (
              <section className="grid min-h-80 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <div><ClipboardList className="mx-auto text-[#00BFFF]" size={32} /><h2 className="mt-4 text-xl font-black">Fila vazia</h2><p className="mt-2 text-slate-500">Importe uma mensagem para começar a revisão.</p><a href="/admin/agendamentos" className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Importar mensagem</a></div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
