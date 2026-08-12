import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import ScrollToTop from "./components/ScrollToTop";

const Home = lazy(() => import("@/pages/Home"));
const Admin = lazy(() => import("@/pages/Admin"));
const AppointmentImport = lazy(() => import("@/pages/AppointmentImport"));
const AppointmentReview = lazy(() => import("@/pages/AppointmentReview"));
const Reservations = lazy(() => import("@/pages/Reservations"));
const CrmModule = lazy(() => import("@/pages/CrmModule"));

function LoadingRoute() {
  return <main className="grid min-h-screen place-items-center bg-[#f3f8fa] text-sm font-bold text-slate-500">Carregando...</main>;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={<LoadingRoute />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/agendamentos" element={<AppointmentImport />} />
          <Route path="/admin/agendamentos/revisar" element={<AppointmentReview />} />
          <Route path="/admin/reservas" element={<Reservations />} />
          <Route path="/admin/brinquedos" element={<Navigate to="/admin?tab=products" replace />} />
          <Route path="/admin/catalogo" element={<Navigate to="/admin?tab=products" replace />} />
          <Route path="/admin/clientes" element={<CrmModule module="customers" />} />
          <Route path="/admin/orcamentos" element={<CrmModule module="quotes" />} />
          <Route path="/admin/financeiro" element={<CrmModule module="finance" />} />
          <Route path="/admin/contratos" element={<CrmModule module="contracts" />} />
          <Route path="/admin/recibos" element={<CrmModule module="receipts" />} />
          <Route path="/admin/disponibilidade" element={<CrmModule module="availability" />} />
          <Route path="/admin/estatisticas" element={<CrmModule module="statistics" />} />
          <Route path="/admin/empresa" element={<CrmModule module="company" />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
