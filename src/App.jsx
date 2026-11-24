import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Home from "./pages/Home.jsx";
import Fleet from "./pages/Fleet.jsx";
import VehicleDetails from "./pages/VehicleDetails.jsx";
import Booking from "./pages/Booking.jsx";
import Bookings from "./pages/Bookings.jsx";
import Admin from "./pages/Admin.jsx";
import Auth from "./pages/Auth.jsx";

export default function App() {
  return <div className="app-shell">
    <ScrollToTop />
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/fleet" element={<Fleet />} />
      <Route path="/vehicle/:id" element={<VehicleDetails />} />
      <Route path="/book/:id" element={<Booking />} />
      <Route path="/bookings" element={<Bookings />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/login" element={<Auth />} />
      <Route path="*" element={<main className="container page-main empty-state"><h1>Page not found</h1><p>The page you're looking for doesn't exist.</p></main>} />
    </Routes>
    <Footer />
  </div>;
}
