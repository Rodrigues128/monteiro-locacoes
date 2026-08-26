import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardPaste,
  FileText,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import {
  hashAppointmentMessage,
  parseAppointmentMessage,
} from "@/lib/appointmentParser";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import AdminWorkspace from "@/components/admin/AdminWorkspace";
import { Link } from "react-router-dom";

const example = `🎡 DADOS PARA AGENDAMENTO 🎡

*NOME:* Kamila
*CPF / CNPJ:* 01821959108
*TELEFONE:* 67 9248-6564
*DATA:* 08/08/2026
*ENDEREÇO:* Rua Ariramba, 215
*LOCAL (espaço, casa, etc..):* Escola
*HORÁRIO (Início – término):* 12h

───────────────

*SERVIÇO:*
* Pula pula G
* Monitor - 4h

*VALOR: R$ 250,00*`;

function Summary({ result }) {
  const data = [
    ["Cliente", result.client.name],
    ["Telefone", result.client.phone],
    ["Data", result.event.date],
    [
      "Horário",
      result.event.start_time &&
        `${result.event.start_time}${result.event.end_time ? ` às ${result.event.end_time}` : ""}`,
    ],
    ["Endereço", result.event.address],
    ["Local", result.event.venue_type],
    [
      "Valor",
      result.total_amount === null
        ? null
        : `R$ ${result.total_amount.toFixed(2).replace(".", ",")}`,
    ],
  ];
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-50 text-[#00BFFF]">
          <FileText size={20} />
        </span>
        <div>
          <h2 className="font-black">Dados identificados</h2>
          <p className="text-sm text-slate-500">
            Revise antes de confirmar em uma próxima etapa.
          </p>
        </div>
      </div>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        {data.map(([name, value]) => (
          <div key={name}>
            <dt className="text-xs font-black uppercase tracking-wide text-slate-400">
              {name}
            </dt>
            <dd className="mt-1 font-semibold text-slate-800">
              {value || "Não informado"}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
          Serviços extraídos
        </p>
        {result.services.length ? (
          <ul className="mt-3 space-y-2">
            {result.services.map((service) => (
              <li
                key={service.normalized_name}
                className="rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700"
              >
                {service.original_name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            Nenhum serviço identificado.
          </p>
        )}
      </div>
      {result.issues.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="flex items-center gap-2 font-bold text-amber-800">
            <TriangleAlert size={18} /> Revisão necessária
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
            {result.issues.map((issue) => (
              <li key={issue.field}>{issue.message}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default function AppointmentImport() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!supabase) return;
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
  const process = () => {
    if (!message.trim())
      return setNotice("Cole uma mensagem de agendamento para continuar.");
    setNotice("");
    setResult(parseAppointmentMessage(message));
  };
  const save = async () => {
    if (!supabase || !result) return;
    setBusy(true);
    setNotice("");
    try {
      const contentHash = await hashAppointmentMessage(message);
      const { data: existing, error: duplicateError } = await supabase
        .from("appointment_messages")
        .select("id")
        .eq("source", "manual")
        .eq("content_hash", contentHash)
        .limit(1);
      if (duplicateError) throw duplicateError;
      if (existing?.length) {
        setNotice(
          "Esta mesma mensagem já foi importada e está na fila de revisão.",
        );
        return;
      }
      const { data: saved, error } = await supabase
        .from("appointment_messages")
        .insert({
          source: "manual",
          content_hash: contentHash,
          original_text: message.trim(),
          status: "pending_review",
          extracted_data: result,
          validation_issues: result.issues,
          processed_at: new Date().toISOString(),
        })
        .select("id")
        .single();
      if (error) throw error;
      const items = result.services.map((service) => ({
        message_id: saved.id,
        original_name: service.original_name,
        normalized_name: service.normalized_name,
      }));
      if (items.length) {
        const { error: itemsError } = await supabase
          .from("appointment_message_items")
          .insert(items);
        if (itemsError) throw itemsError;
      }
      setNotice(
        "Mensagem salva para revisão. Nenhum agendamento foi criado automaticamente.",
      );
      setMessage("");
      setResult(null);
    } catch (error) {
      setNotice(`Não foi possível salvar: ${error.message}`);
    } finally {
      setBusy(false);
    }
  };
  if (!isSupabaseConfigured)
    return (
      <main className="grid min-h-screen place-items-center p-5 text-center">
        Configure o Supabase para usar a importação.
      </main>
    );
  if (!session)
    return (
      <main className="grid min-h-screen place-items-center p-5 text-center">
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
      <main className="grid min-h-screen place-items-center p-5 text-center">
        Acesso restrito a administradores.
      </main>
    );
  return (
    <AdminWorkspace>
      <div className="mx-auto max-w-6xl">
        <Link
          to="/admin"
          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#008fc0]"
        >
          <ArrowLeft size={16} /> Voltar ao painel
        </Link>
        <header className="mt-8 max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[.2em] text-[#00BFFF]">
            Agendamentos
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-[-.04em]">
            Importar mensagem
          </h1>
          <p className="mt-3 leading-relaxed text-slate-500">
            Cole a mensagem enviada ao grupo interno. O sistema organiza os
            dados, mas ainda exige revisão antes de criar o agendamento.
          </p>
          <Link
            to="/admin/agendamentos/revisar"
            className="mt-4 inline-flex text-sm font-bold text-[#008fc0]"
          >
            Ver fila de revisão →
          </Link>
        </header>
        <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-slate-950 px-3 py-1.5 text-white">
            1. Importar mensagem
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 text-slate-500">
            2. Revisar dados e produtos
          </span>
          <span className="rounded-full bg-white px-3 py-1.5 text-slate-500">
            3. Confirmar reserva
          </span>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-black">Mensagem original</h2>
              <button
                onClick={() => {
                  setMessage(example);
                  setResult(null);
                }}
                className="text-sm font-bold text-[#008fc0]"
              >
                Usar exemplo
              </button>
            </div>
            <textarea
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setResult(null);
              }}
              placeholder="Cole aqui a mensagem de agendamento..."
              className="mt-4 min-h-[420px] w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed outline-none focus:border-[#00BFFF] focus:bg-white"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={process}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
              >
                <ClipboardPaste size={17} /> Processar mensagem
              </button>
              {result && (
                <button
                  disabled={busy}
                  onClick={save}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#00BFFF] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {busy ? (
                    <LoaderCircle className="animate-spin" size={17} />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}{" "}
                  Salvar para revisão
                </button>
              )}
            </div>
            {notice && (
              <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                {notice}
              </p>
            )}
          </section>
          {result ? (
            <Summary result={result} />
          ) : (
            <section className="grid place-items-center rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              <div>
                <ClipboardPaste className="mx-auto text-[#00BFFF]" size={32} />
                <h2 className="mt-4 text-lg font-black text-slate-800">
                  Aguardando uma mensagem
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed">
                  Após processar, você verá os dados extraídos e os campos que
                  exigem revisão.
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </AdminWorkspace>
  );
}
