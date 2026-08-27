import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchAdminGallery, fetchAdminProducts } from "@/lib/adminCatalog";
import {
  getImageUrl,
  isSupabaseConfigured,
  getSessionPersistence,
  setSessionPersistence,
  STORAGE_BUCKET,
} from "@/lib/supabase";
import { adminSupabase as supabase } from "@/lib/adminApi";
import AdminDashboard from "@/components/admin/AdminDashboard";

const emptyProduct = {
  name: "",
  category: "",
  recommended_age: "Livre",
  size: "Consultar",
  allows_water: false,
  capacity: "Consultar",
  price: "",
  description: "",
  features: "",
  image_path: null,
  active: true,
};
/** @type {Record<string, string>} */
const imageExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const maxImageSize = 5 * 1024 * 1024;
const productCategories = [
  "Infláveis",
  "Brinquedos",
  "Jogos",
  "Doces",
  "Decoração",
  "Estrutura",
  "Serviços",
];

function getInitialTab() {
  const tab = new URLSearchParams(window.location.search).get("tab");
  return tab === "products" || tab === "gallery" ? tab : "overview";
}

/** @param {File} file @param {"products" | "gallery"} folder */
async function uploadImage(file, folder) {
  if (!supabase) throw new Error("Supabase não configurado.");
  const extension = imageExtensions[file.type];
  if (!extension) throw new Error("Envie apenas imagens JPG, PNG ou WEBP.");
  if (file.size > maxImageSize)
    throw new Error("Cada imagem pode ter no máximo 5 MB.");
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}

/** @param {string | null} path */
async function removeImage(path) {
  if (path && supabase)
    await supabase.storage.from(STORAGE_BUCKET).remove([path]);
}

/** @typedef {{ message: string }} NoticeProps */

function Notice(/** @type {NoticeProps} */ { message }) {
  return message ? (
    <p className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-xl">
      {message}
    </p>
  ) : null;
}

function DeleteConfirmation({ target, busy, onCancel, onConfirm }) {
  if (!target) return null;
  const product = target.type === "product";
  const title = product
    ? `Excluir “${target.item.name}”?`
    : "Excluir esta foto da galeria?";
  const description = product
    ? "A atração será removida do catálogo e não aparecerá mais para seus clientes."
    : "A imagem será removida da galeria pública e do armazenamento do projeto.";

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/55 p-5 backdrop-blur-sm"
      onClick={busy ? undefined : onCancel}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-2xl"
      >
        <header className="bg-gradient-to-br from-rose-500 to-rose-700 px-6 py-7 text-white sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20">
              <Trash2 size={23} />
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
            Ação permanente
          </p>
          <h2
            id="delete-title"
            className="mt-2 text-3xl font-black tracking-[-.04em]"
          >
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/85">
            {description}
          </p>
        </header>
        <div className="p-6 sm:p-8">
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm leading-relaxed text-rose-800">
            Esta ação não pode ser desfeita. Confira o item antes de continuar.
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
            >
              {busy ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Trash2 size={17} />
              )}
              {busy ? "Excluindo..." : "Excluir definitivamente"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/** @typedef {{ onLogin: () => void }} LoginProps */

function Login(/** @type {LoginProps} */ { onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(getSessionPersistence);
  const submit = async (event) => {
    event.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError("");
    setSessionPersistence(keepSignedIn);
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
      remember: keepSignedIn,
    });
    setPassword("");
    setLoading(false);
    if (loginError) setError("E-mail ou senha inválidos.");
    else onLogin();
  };
  return (
    <main className="min-h-screen bg-[#f2f8fb] p-4 text-slate-900 sm:p-7">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(15,51,70,0.15)] lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col">
          <img
            src="/images/hero-toboga.png"
            alt="Brinquedo inflável da Monteiro Locações"
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#003d59]/90 via-[#081d35]/80 to-[#08111f]/95" />
          <div className="relative flex items-center gap-3">
            <img
              src="/images/logo.jpg"
              alt="Monteiro Locações"
              className="h-12 w-12 rounded-2xl border border-white/30 object-cover"
            />
            <div>
              <p className="font-black tracking-tight">MONTEIRO</p>
              <p className="text-xs font-bold tracking-[.22em] text-cyan-200">
                LOCAÇÕES
              </p>
            </div>
          </div>
          <div className="relative my-auto max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold text-cyan-100">
              <ShieldCheck size={15} /> ACESSO RESTRITO
            </span>
            <h1 className="mt-6 text-5xl font-black leading-[.95] tracking-[-.05em]">
              Seu catálogo, sempre sob controle.
            </h1>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-slate-200">
              Atualize atrações, preços e fotos da galeria em um único lugar,
              com segurança.
            </p>
          </div>
          <p className="relative text-sm text-slate-300">
            Monteiro Locações · Campo Grande, MS
          </p>
        </section>
        <section className="relative flex items-center justify-center px-6 py-10 sm:px-12 lg:px-16">
          <a
            href="/"
            className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#008fc0] sm:left-10 sm:top-10"
          >
            <ArrowLeft size={16} /> Voltar ao site
          </a>
          <form onSubmit={submit} className="w-full max-w-md pt-12 lg:pt-0">
            <div className="lg:hidden">
              <div className="flex items-center gap-3">
                <img
                  src="/images/logo.jpg"
                  alt="Monteiro Locações"
                  className="h-12 w-12 rounded-2xl object-cover"
                />
                <div>
                  <p className="font-black tracking-tight">MONTEIRO</p>
                  <p className="text-xs font-bold tracking-[.22em] text-[#00BFFF]">
                    LOCAÇÕES
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-10 text-xs font-black uppercase tracking-[.2em] text-[#00BFFF] lg:mt-0">
              Área administrativa
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-[-.045em] text-slate-900">
              Bem-vindo de volta
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Entre com seus dados para administrar o conteúdo do site.
            </p>
            {error && (
              <p className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}
            <div className="mt-8 space-y-5">
              <label className="block text-sm font-bold text-slate-700">
                E-mail
                <div className="relative mt-2">
                  <Mail
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={19}
                  />
                  <input
                    required
                    autoComplete="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#00BFFF] focus:bg-white focus:ring-4 focus:ring-[#00BFFF]/10"
                  />
                </div>
              </label>
              <label className="block text-sm font-bold text-slate-700">
                Senha
                <div className="relative mt-2">
                  <LockKeyhole
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={19}
                  />
                  <input
                    required
                    autoComplete="current-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#00BFFF] focus:bg-white focus:ring-4 focus:ring-[#00BFFF]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 transition hover:border-cyan-200 hover:bg-cyan-50/40">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(event) => setKeepSignedIn(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#00BFFF] focus:ring-[#00BFFF]"
                />
                <span>
                  <strong className="block text-slate-800">
                    Manter conectado neste dispositivo
                  </strong>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                    Desmarque em computadores compartilhados. Nesse caso, a sessão é encerrada ao fechar o navegador.
                  </span>
                </span>
              </label>
            </div>
            <button
              disabled={loading}
              className="mt-8 flex w-full items-center justify-center rounded-2xl bg-[#00BFFF] py-4 font-black text-white shadow-[0_12px_25px_rgba(0,191,255,0.25)] transition hover:bg-[#00a9dc] hover:shadow-[0_15px_30px_rgba(0,191,255,0.32)] disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Acessar painel"}
            </button>
            <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
              Acesso exclusivo para administradores autorizados.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}

/** @typedef {{
 *   product: import("@/lib/catalog").Product | null,
 *   onSaved: (message: string, failed?: boolean) => void,
 *   onCancel: () => void
 * }} ProductFormProps */

function ProductForm(
  /** @type {ProductFormProps} */ { product, onSaved, onCancel },
) {
  const [form, setForm] = useState(() =>
    product
      ? {
          ...product,
          features: product.features.join("\n"),
          price: product.price ?? "",
        }
      : emptyProduct,
  );
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState(productCategories);
  const formRef = useRef(null);
  const field = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  useEffect(() => {
    const categoryField = formRef.current
      ?.querySelectorAll("label")[1]
      ?.querySelector("input");
    categoryField?.setAttribute("list", "product-category-list");
    categoryField?.setAttribute(
      "placeholder",
      "Escolha ou digite uma categoria",
    );
    supabase
      ?.from("products")
      .select("category")
      .then(({ data }) => {
        const savedCategories =
          data?.map((item) => item.category).filter(Boolean) || [];
        setCategoryOptions([
          ...new Set([...productCategories, ...savedCategories]),
        ]);
      });
  }, []);
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      let imagePath = form.image_path;
      if (file) {
        const uploaded = await uploadImage(file, "products");
        imagePath = uploaded;
      }
      const payload = {
        ...form,
        image_path: imagePath,
        price: form.price === "" ? null : Number(form.price),
        features: form.features
          .split("\n")
          .map((feature) => feature.trim())
          .filter(Boolean),
      };
      delete payload.id;
      delete payload.image;
      delete payload.imagePath;
      const query = product
        ? supabase.from("products").update(payload).eq("id", product.id)
        : supabase.from("products").insert(payload);
      const { error } = await query;
      if (error) throw error;
      if (file && product?.image_path) await removeImage(product.image_path);
      onSaved("Produto salvo com sucesso.");
    } catch (error) {
      onSaved(`Erro ao salvar: ${error.message}`, true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <form
        ref={formRef}
        onSubmit={save}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between border-b border-slate-100 px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#00BFFF]">
              Catálogo
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">
              {product ? "Editar atração" : "Nova atração"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Preencha os dados que aparecerão para seus clientes.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-xl font-medium text-slate-500 transition hover:bg-slate-200"
            aria-label="Fechar"
          >
            ×
          </button>
        </header>
        <div className="grid gap-5 overflow-y-auto p-6 sm:p-8 md:grid-cols-2">
          {[
            ["name", "Nome da atração"],
            ["category", "Categoria"],
            ["recommended_age", "Idade recomendada"],
            ["size", "Tamanho / medidas"],
            ["capacity", "Capacidade"],
          ].map(([key, label]) => (
            <label key={key} className="text-sm font-bold text-slate-700">
              {label}
              <input
                required
                value={form[key]}
                onChange={(event) => field(key, event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#00BFFF] focus:bg-white"
              />
            </label>
          ))}
          <label className="text-sm font-bold text-slate-700">
            Preço (deixe vazio para consulta)
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => field("price", event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#00BFFF] focus:bg-white"
            />
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
            <input
              type="checkbox"
              checked={form.allows_water}
              onChange={(event) => field("allows_water", event.target.checked)}
              className="h-4 w-4 accent-[#00BFFF]"
            />{" "}
            Permite uso com água
          </label>
          <label className="md:col-span-2 text-sm font-bold text-slate-700">
            Descrição
            <textarea
              required
              value={form.description}
              onChange={(event) => field("description", event.target.value)}
              placeholder="Descreva a atração para o cliente"
              className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#00BFFF] focus:bg-white"
            />
          </label>
          <label className="md:col-span-2 text-sm font-bold text-slate-700">
            Recursos inclusos{" "}
            <span className="font-medium text-slate-400">(um por linha)</span>
            <textarea
              value={form.features}
              onChange={(event) => field("features", event.target.value)}
              placeholder="Ex.: Montagem inclusa"
              className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-[#00BFFF] focus:bg-white"
            />
          </label>
          <label className="text-sm font-bold text-slate-700">
            Foto principal
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="mt-2 block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm font-medium text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#00BFFF] file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-white"
            />
          </label>
          <div className="flex items-center gap-3">
            {form.image_path && (
              <img
                src={getImageUrl(form.image_path)}
                alt="Prévia do produto"
                className="h-16 w-20 rounded-xl object-cover"
              />
            )}
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => field("active", event.target.checked)}
                className="h-4 w-4 accent-[#00BFFF]"
              />{" "}
              Produto ativo
            </label>
          </div>
        </div>
        <footer className="flex flex-wrap justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600"
          >
            Cancelar
          </button>
          <button
            disabled={busy}
            className="rounded-xl bg-[#00BFFF] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(0,191,255,0.22)] disabled:opacity-60"
          >
            {busy ? "Salvando..." : "Salvar atração"}
          </button>
        </footer>
      </form>
      <datalist id="product-category-list">
        {categoryOptions.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>
    </div>
  );
}

export default function Admin() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [products, setProducts] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [tab, setTab] = useState(getInitialTab);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(/** @type {boolean | null} */ null);
  const selectTab = (nextTab) => {
    navigate(nextTab === "overview" ? "/admin" : `/admin?tab=${nextTab}`);
  };
  const reload = async () => {
    const [loadedProducts, loadedGallery, loadedReservations, pendingMessages] =
      await Promise.all([
        fetchAdminProducts(),
        fetchAdminGallery(),
        supabase
          .from("appointments")
          .select(
            "id, event_date, start_time, end_time, address, venue_type, total_amount, status, customers(id, name, phone), appointment_items(quantity, original_name, products(name))",
          )
          .in("status", ["confirmed", "completed"])
          .order("event_date", { ascending: true }),
        supabase
          .from("appointment_messages")
          .select("id", { count: "exact", head: true })
          .in("status", ["pending_review", "ready_to_confirm"]),
      ]);
    if (loadedReservations.error) throw loadedReservations.error;
    if (pendingMessages.error) throw pendingMessages.error;
    setProducts(loadedProducts);
    setGallery(loadedGallery);
    setReservations(loadedReservations.data || []);
    setPendingReviewCount(pendingMessages.count || 0);
  };
  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);
  useEffect(() => {
    const nextTab = new URLSearchParams(search).get("tab");
    setTab(
      nextTab === "products" || nextTab === "gallery" ? nextTab : "overview",
    );
  }, [search]);
  useEffect(() => {
    if (!supabase) return;
    let active = true;

    const restoreSession = async () => {
      const {
        data: { session: storedSession },
      } = await supabase.auth.getSession();

      if (!storedSession) {
        if (active) {
          setSession(null);
          setLoading(false);
        }
        return;
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!active) return;
      const hasInvalidSession = error?.status === 401 || error?.status === 403;
      if (hasInvalidSession || (!error && !user)) {
        await supabase.auth.signOut({ scope: "local" });
        setSession(null);
      } else {
        setSession({ ...storedSession, user });
      }
      setLoading(false);
    };

    restoreSession();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        if (event === "INITIAL_SESSION") return;
        setSession(nextSession);
        setLoading(false);
      },
    );
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!session || !supabase) {
      setIsAdmin(null);
      return;
    }
    setIsAdmin(null);
    supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error)
          setNotice(
            `Não foi possível confirmar sua permissão: ${error.message}`,
          );
        setIsAdmin(Boolean(data) && !error);
      });
  }, [session]);
  useEffect(() => {
    if (session && isAdmin)
      reload().catch((error) =>
        setNotice(`Erro ao carregar dados: ${error.message}`),
      );
  }, [session, isAdmin]);
  const notify = (message, failed = false) => {
    setNotice(message);
    if (!failed) {
      setEditing(null);
      reload().catch(() => {});
    }
  };
  const removeProduct = async (product) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);
    if (error) return notify(`Erro ao excluir: ${error.message}`, true);
    await removeImage(product.image_path);
    notify("Produto excluído.");
  };
  const toggleProduct = async (product) => {
    const nextStatus = !product.active;
    const { error } = await supabase
      .from("products")
      .update({ active: nextStatus })
      .eq("id", product.id);
    notify(
      error
        ? `Erro: ${error.message}`
        : `“${product.name}” está ${nextStatus ? "ativa" : "inativa"}.`,
      Boolean(error),
    );
  };
  const uploadGallery = async (event) => {
    const files = [...(event.target.files || [])];
    if (!files.length) return;
    try {
      await Promise.all(
        files.map(async (file, index) => {
          const imagePath = await uploadImage(file, "gallery");
          const { error } = await supabase.from("gallery_images").insert({
            image_path: imagePath,
            alt_text: file.name.replace(/\.[^.]+$/, ""),
            sort_order: gallery.length + index + 1,
          });
          if (error) throw error;
        }),
      );
      notify("Fotos adicionadas.");
    } catch (error) {
      notify(`Erro no upload: ${error.message}`, true);
    } finally {
      event.target.value = "";
    }
  };
  const updateGallery = async (image, values) => {
    const { error } = await supabase
      .from("gallery_images")
      .update(values)
      .eq("id", image.id);
    notify(
      error ? `Erro: ${error.message}` : "Foto atualizada.",
      Boolean(error),
    );
  };
  const removeGallery = async (image) => {
    const { error } = await supabase
      .from("gallery_images")
      .delete()
      .eq("id", image.id);
    if (error) return notify(`Erro ao excluir: ${error.message}`, true);
    await removeImage(image.image_path);
    notify("Foto excluída.");
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === "product")
        await removeProduct(deleteTarget.item);
      else await removeGallery(deleteTarget.item);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };
  if (!isSupabaseConfigured)
    return (
      <main className="grid min-h-screen place-items-center p-5 text-center">
        <div>
          <h1 className="text-2xl font-black">Supabase não configurado</h1>
          <p className="mt-2 text-gray-500">
            Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no arquivo
            `.env`.
          </p>
        </div>
      </main>
    );
  if (loading)
    return (
      <main className="grid min-h-screen place-items-center">
        Carregando painel...
      </main>
    );
  if (!session) return <Login onLogin={() => {}} />;
  if (isAdmin === null)
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50">
        Verificando permissões...
      </main>
    );
  if (!isAdmin)
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 p-5 text-center">
        <section className="max-w-lg rounded-3xl border border-amber-100 bg-white p-8 shadow-xl">
          <p className="text-sm font-black uppercase tracking-widest text-amber-600">
            Acesso sem permissão
          </p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">
            Seu usuário ainda não é administrador
          </h1>
          <p className="mt-4 leading-relaxed text-slate-500">
            Para cadastrar produtos e enviar fotos, execute no SQL Editor do
            Supabase o comando abaixo com o UUID do usuário logado.
          </p>
          <pre className="mt-6 overflow-auto rounded-2xl bg-slate-950 p-4 text-left text-sm text-cyan-200">
            insert into public.admin_users (user_id) values ('UUID_DO_USUÁRIO');
          </pre>
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-6 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white"
          >
            Sair
          </button>
        </section>
      </main>
    );
  return (
    <>
      <AdminDashboard
        products={products}
        gallery={gallery}
        reservations={reservations}
        pendingReviewCount={pendingReviewCount}
        tab={tab}
        setTab={selectTab}
        setEditing={setEditing}
        productForm={
          editing && (
            <ProductForm
              product={editing.id ? editing : null}
              onSaved={notify}
              onCancel={() => setEditing(null)}
            />
          )
        }
        onSignOut={() => supabase.auth.signOut()}
        onToggleProduct={toggleProduct}
        onRemoveProduct={(product) =>
          setDeleteTarget({ type: "product", item: product })
        }
        onUploadGallery={uploadGallery}
        onUpdateGallery={updateGallery}
        onRemoveGallery={(image) =>
          setDeleteTarget({ type: "gallery", item: image })
        }
      />
      <DeleteConfirmation
        target={deleteTarget}
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
      <Notice message={notice} />
    </>
  );
}
