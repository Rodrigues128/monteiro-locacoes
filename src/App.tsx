import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import ScrollToTop from "./components/ScrollToTop";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import AppointmentImport from "@/pages/AppointmentImport";
import AppointmentReview from "@/pages/AppointmentReview";
import Reservations from "@/pages/Reservations";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/agendamentos" element={<AppointmentImport />} />
        <Route path="/admin/agendamentos/revisar" element={<AppointmentReview />} />
        <Route path="/admin/reservas" element={<Reservations />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
