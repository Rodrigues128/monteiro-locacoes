import { useEffect, useState } from "react"
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react"
import { fetchGallery, fetchProducts } from "@/lib/catalog"
import { getImageUrl, isSupabaseConfigured, STORAGE_BUCKET, supabase } from "@/lib/supabase"
import AdminDashboard from "@/components/admin/AdminDashboard"

const emptyProduct = { name: "", category: "", recommended_age: "Livre", size: "Consultar", allows_water: false, capacity: "Consultar", price: "", description: "", features: "", image_path: null, active: true }

/** @param {File} file @param {"products" | "gallery"} folder */
async function uploadImage(file, folder) {
  if (!supabase) throw new Error("Supabase não configurado.")
  const extension = file.name.split(".").pop() || "jpg"
  const path = `${folder}/${crypto.randomUUID()}.${extension.toLowerCase()}`
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw error
  return path
}

/** @param {string | null} path */
async function removeImage(path) {
  if (path && supabase) await supabase.storage.from(STORAGE_BUCKET).remove([path])
}

function Notice({ message }) {
  return message ? <p className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-xl">{message}</p> : null
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const submit = async (event) => {
    event.preventDefault()
    if (!supabase) return
    setLoading(true); setError("")
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (loginError) setError("E-mail ou senha inválidos.")
    else onLogin()
  }
  return <main className="min-h-screen bg-[#f2f8fb] p-4 text-slate-900 sm:p-7">
    <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(15,51,70,0.15)] lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col">
        <img src="/images/hero-toboga.png" alt="Brinquedo inflável da Monteiro Locações" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#003d59]/90 via-[#081d35]/80 to-[#08111f]/95" />
        <div className="relative flex items-center gap-3"><img src="/images/logo.jpg" alt="Monteiro Locações" className="h-12 w-12 rounded-2xl border border-white/30 object-cover" /><div><p className="font-black tracking-tight">MONTEIRO</p><p className="text-xs font-bold tracking-[.22em] text-cyan-200">LOCAÇÕES</p></div></div>
        <div className="relative my-auto max-w-md"><span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/30 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold text-cyan-100"><ShieldCheck size={15} /> ACESSO RESTRITO</span><h1 className="mt-6 text-5xl font-black leading-[.95] tracking-[-.05em]">Seu catálogo, sempre sob controle.</h1><p className="mt-6 max-w-sm text-base leading-relaxed text-slate-200">Atualize atrações, preços e fotos da galeria em um único lugar, com segurança.</p></div>
        <p className="relative text-sm text-slate-300">Monteiro Locações · Campo Grande, MS</p>
      </section>
      <section className="relative flex items-center justify-center px-6 py-10 sm:px-12 lg:px-16">
        <a href="/" className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#008fc0] sm:left-10 sm:top-10"><ArrowLeft size={16} /> Voltar ao site</a>
        <form onSubmit={submit} className="w-full max-w-md pt-12 lg:pt-0">
          <div className="lg:hidden"><div className="flex items-center gap-3"><img src="/images/logo.jpg" alt="Monteiro Locações" className="h-12 w-12 rounded-2xl object-cover" /><div><p className="font-black tracking-tight">MONTEIRO</p><p className="text-xs font-bold tracking-[.22em] text-[#00BFFF]">LOCAÇÕES</p></div></div></div>
          <p className="mt-10 text-xs font-black uppercase tracking-[.2em] text-[#00BFFF] lg:mt-0">Área administrativa</p><h2 className="mt-3 text-4xl font-black tracking-[-.045em] text-slate-900">Bem-vindo de volta</h2><p className="mt-3 text-sm leading-relaxed text-slate-500">Entre com seus dados para administrar o conteúdo do site.</p>
          {error && <p className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
          <div className="mt-8 space-y-5"><label className="block text-sm font-bold text-slate-700">E-mail<div className="relative mt-2"><Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} /><input required autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seuemail@exemplo.com" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#00BFFF] focus:bg-white focus:ring-4 focus:ring-[#00BFFF]/10" /></div></label><label className="block text-sm font-bold text-slate-700">Senha<div className="relative mt-2"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} /><input required autoComplete="current-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Digite sua senha" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#00BFFF] focus:bg-white focus:ring-4 focus:ring-[#00BFFF]/10" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label></div>
          <button disabled={loading} className="mt-8 flex w-full items-center justify-center rounded-2xl bg-[#00BFFF] py-4 font-black text-white shadow-[0_12px_25px_rgba(0,191,255,0.25)] transition hover:bg-[#00a9dc] hover:shadow-[0_15px_30px_rgba(0,191,255,0.32)] disabled:cursor-wait disabled:opacity-60">{loading ? "Entrando..." : "Acessar painel"}</button><p className="mt-6 text-center text-xs leading-relaxed text-slate-400">Acesso exclusivo para administradores autorizados.</p>
        </form>
      </section>
    </div>
  </main>
}

function ProductForm({ product, onSaved, onCancel }) {
  const [form, setForm] = useState(() => product ? { ...product, features: product.features.join("\n"), price: product.price ?? "" } : emptyProduct)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const field = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const save = async (event) => {
    event.preventDefault(); setBusy(true)
    try {
      let imagePath = form.image_path
      if (file) { const uploaded = await uploadImage(file, "products"); imagePath = uploaded }
      const payload = { ...form, image_path: imagePath, price: form.price === "" ? null : Number(form.price), features: form.features.split("\n").map((feature) => feature.trim()).filter(Boolean) }
      delete payload.id; delete payload.image; delete payload.imagePath
      const query = product ? supabase.from("products").update(payload).eq("id", product.id) : supabase.from("products").insert(payload)
      const { error } = await query
      if (error) throw error
      if (file && product?.image_path) await removeImage(product.image_path)
      onSaved("Produto salvo com sucesso.")
    } catch (error) { onSaved(`Erro ao salvar: ${error.message}`, true) } finally { setBusy(false) }
  }
  return <form onSubmit={save} className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm md:grid-cols-2"><h2 className="md:col-span-2 text-xl font-black">{product ? "Editar produto" : "Novo produto"}</h2>{[["name", "Nome"], ["category", "Categoria"], ["recommended_age", "Idade recomendada"], ["size", "Tamanho"], ["capacity", "Capacidade"]].map(([key, label]) => <label key={key} className="text-sm font-bold">{label}<input required value={form[key]} onChange={(event) => field(key, event.target.value)} className="mt-1 w-full rounded-xl border p-2.5" /></label>)}<label className="text-sm font-bold">Preço (vazio = consulta)<input type="number" min="0" step="0.01" value={form.price} onChange={(event) => field("price", event.target.value)} className="mt-1 w-full rounded-xl border p-2.5" /></label><label className="flex items-end gap-2 pb-3 text-sm font-bold"><input type="checkbox" checked={form.allows_water} onChange={(event) => field("allows_water", event.target.checked)} /> Permite água</label><label className="md:col-span-2 text-sm font-bold">Descrição<textarea required value={form.description} onChange={(event) => field("description", event.target.value)} className="mt-1 min-h-24 w-full rounded-xl border p-2.5" /></label><label className="md:col-span-2 text-sm font-bold">Recursos (um por linha)<textarea value={form.features} onChange={(event) => field("features", event.target.value)} className="mt-1 min-h-24 w-full rounded-xl border p-2.5" /></label><label className="text-sm font-bold">Foto principal<input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} className="mt-1 block w-full text-sm" /></label>{form.image_path && <img src={getImageUrl(form.image_path)} alt="Prévia do produto" className="h-20 w-28 rounded-xl object-cover" />}<label className="flex items-end gap-2 pb-3 text-sm font-bold"><input type="checkbox" checked={form.active} onChange={(event) => field("active", event.target.checked)} /> Produto ativo</label><div className="flex gap-3 md:col-span-2"><button disabled={busy} className="rounded-xl bg-[#00BFFF] px-5 py-2.5 font-bold text-white">{busy ? "Salvando..." : "Salvar produto"}</button><button type="button" onClick={onCancel} className="rounded-xl border px-5 py-2.5 font-bold">Cancelar</button></div></form>
}

export default function Admin() {
  const [session, setSession] = useState(null)
  const [products, setProducts] = useState([])
  const [gallery, setGallery] = useState([])
  const [editing, setEditing] = useState(null)
  const [notice, setNotice] = useState("")
  const [tab, setTab] = useState("products")
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(/** @type {boolean | null} */ (null))
  const reload = async () => { const [loadedProducts, loadedGallery] = await Promise.all([fetchProducts(true), fetchGallery(true)]); setProducts(loadedProducts); setGallery(loadedGallery) }
  useEffect(() => { if (!supabase) return; supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false) }); const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession)); return () => listener.subscription.unsubscribe() }, [])
  useEffect(() => {
    if (!session || !supabase) { setIsAdmin(null); return }
    setIsAdmin(null)
    supabase.from("admin_users").select("user_id").eq("user_id", session.user.id).maybeSingle().then(({ data, error }) => {
      if (error) setNotice(`Não foi possível confirmar sua permissão: ${error.message}`)
      setIsAdmin(Boolean(data) && !error)
    })
  }, [session])
  useEffect(() => { if (session && isAdmin) reload().catch((error) => setNotice(`Erro ao carregar dados: ${error.message}`)) }, [session, isAdmin])
  const notify = (message, failed = false) => { setNotice(message); if (!failed) { setEditing(null); reload().catch(() => {}) } }
  const removeProduct = async (product) => { if (!window.confirm(`Excluir “${product.name}”?`)) return; const { error } = await supabase.from("products").delete().eq("id", product.id); if (error) return notify(`Erro ao excluir: ${error.message}`, true); await removeImage(product.image_path); notify("Produto excluído.") }
  const toggleProduct = async (product) => { const { error } = await supabase.from("products").update({ active: !product.active }).eq("id", product.id); notify(error ? `Erro: ${error.message}` : "Status atualizado.", Boolean(error)) }
  const uploadGallery = async (event) => { const files = [...(event.target.files || [])]; if (!files.length) return; try { await Promise.all(files.map(async (file, index) => { const imagePath = await uploadImage(file, "gallery"); const { error } = await supabase.from("gallery_images").insert({ image_path: imagePath, alt_text: file.name.replace(/\.[^.]+$/, ""), sort_order: gallery.length + index + 1 }); if (error) throw error })); notify("Fotos adicionadas.") } catch (error) { notify(`Erro no upload: ${error.message}`, true) } finally { event.target.value = "" } }
  const updateGallery = async (image, values) => { const { error } = await supabase.from("gallery_images").update(values).eq("id", image.id); notify(error ? `Erro: ${error.message}` : "Foto atualizada.", Boolean(error)) }
  const removeGallery = async (image) => { if (!window.confirm("Excluir esta foto da galeria?")) return; const { error } = await supabase.from("gallery_images").delete().eq("id", image.id); if (error) return notify(`Erro ao excluir: ${error.message}`, true); await removeImage(image.image_path); notify("Foto excluída.") }
  if (!isSupabaseConfigured) return <main className="grid min-h-screen place-items-center p-5 text-center"><div><h1 className="text-2xl font-black">Supabase não configurado</h1><p className="mt-2 text-gray-500">Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no arquivo `.env`.</p></div></main>
  if (loading) return <main className="grid min-h-screen place-items-center">Carregando painel...</main>
  if (!session) return <Login onLogin={() => {}} />
  if (isAdmin === null) return <main className="grid min-h-screen place-items-center bg-slate-50">Verificando permissões...</main>
  if (!isAdmin) return <main className="grid min-h-screen place-items-center bg-slate-50 p-5 text-center"><section className="max-w-lg rounded-3xl border border-amber-100 bg-white p-8 shadow-xl"><p className="text-sm font-black uppercase tracking-widest text-amber-600">Acesso sem permissão</p><h1 className="mt-3 text-3xl font-black text-slate-900">Seu usuário ainda não é administrador</h1><p className="mt-4 leading-relaxed text-slate-500">Para cadastrar produtos e enviar fotos, execute no SQL Editor do Supabase o comando abaixo com o UUID do usuário logado.</p><pre className="mt-6 overflow-auto rounded-2xl bg-slate-950 p-4 text-left text-sm text-cyan-200">insert into public.admin_users (user_id) values ('UUID_DO_USUÁRIO');</pre><button onClick={() => supabase.auth.signOut()} className="mt-6 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">Sair</button></section></main>
  return <><AdminDashboard products={products} gallery={gallery} tab={tab} setTab={setTab} setEditing={setEditing} productForm={editing && <ProductForm product={editing.id ? editing : null} onSaved={notify} onCancel={() => setEditing(null)} />} onSignOut={() => supabase.auth.signOut()} onToggleProduct={toggleProduct} onRemoveProduct={removeProduct} onUploadGallery={uploadGallery} onUpdateGallery={updateGallery} onRemoveGallery={removeGallery} /><Notice message={notice} /></>
}
