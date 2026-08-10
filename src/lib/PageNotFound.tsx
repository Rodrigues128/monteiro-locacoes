import { Link, useLocation } from "react-router-dom";

export default function PageNotFound() {
  const location = useLocation();

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center">
      <div className="max-w-md space-y-6">
        <p className="text-7xl font-light text-slate-300">404</p>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Página não encontrada
          </h1>
          <p className="mt-3 text-slate-600">
            A página <strong>{location.pathname}</strong> não existe neste site.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex rounded-full bg-[#00BFFF] px-6 py-3 font-bold text-white transition hover:bg-[#009bd1]"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
