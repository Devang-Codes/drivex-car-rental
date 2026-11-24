import { useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

const today = new Date();
const localDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicles, addBooking, user } = useApp();
  const vehicle = vehicles.find((item) => item.id === id);
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "", pickupDate: localDate(today), returnDate: "", notes: "" });
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  const days = useMemo(() => {
    if (!form.pickupDate || !form.returnDate) return 0;
    const start = new Date(`${form.pickupDate}T00:00:00`);
    const end = new Date(`${form.returnDate}T00:00:00`);
    return Math.round((end - start) / 86400000);
  }, [form.pickupDate, form.returnDate]);

  if (!user) return <main className="container page-main"><div className="empty-state"><h2>Sign in before booking</h2><p>Your reservations are linked securely to your account.</p><Link to="/login" className="button">Sign in or register</Link></div></main>;

  if (!vehicle) return <main className="container page-main"><div className="empty-state"><h2>Vehicle not found</h2><Link to="/fleet" className="button">Back to fleet</Link></div></main>;

  const total = Math.max(days, 0) * vehicle.pricePerDay;
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) return setError("Please complete your name, email and phone number.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError("Enter a valid email address.");
    if (!/^[+()\-\s\d]{8,18}$/.test(form.phone)) return setError("Enter a valid phone number.");
    if (days < 1) return setError("Return date must be at least one day after pickup.");
    if (new Date(`${form.pickupDate}T00:00:00`) < new Date(`${localDate(today)}T00:00:00`)) return setError("Pickup date cannot be in the past.");
    try { const booking = await addBooking({ ...form, vehicleId: vehicle.id, vehicleName: vehicle.name, pricePerDay: vehicle.pricePerDay, days, total }); setCreated(booking); } catch (err) { setError(err.message); }
  };

  if (created) return <main className="container page-main"><div className="success-panel"><span className="success-icon"><CheckCircle2 size={32} /></span><span className="eyebrow">REQUEST SAVED</span><h1>Your request is in.</h1><p>Your booking reference is <strong>{created.id}</strong>. Its current status is Pending. The server has checked vehicle availability for your dates.</p><div className="summary-box"><span>{vehicle.name}</span><strong>{total.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</strong><small>{days} rental day(s) · rental estimate</small></div><div className="hero-actions"><Link to="/bookings" className="button">View my bookings</Link><Link to="/fleet" className="button button-ghost">Continue browsing</Link></div></div></main>;

  return <main className="container page-main">
    <Link to={`/vehicle/${vehicle.id}`} className="back-link"><ArrowLeft size={16} /> Back to vehicle</Link>
    <div className="booking-layout">
      <section className="form-panel"><span className="eyebrow">YOUR NEXT JOURNEY</span><h1>Request a <em>booking.</em></h1><p className="form-intro">Enter your details and dates. Your estimate updates as you plan.</p>
        <form onSubmit={submit} className="booking-form">
          <div className="form-section-title">Contact details</div>
          <label>Full name<input name="name" value={form.name} readOnly autoComplete="name" required maxLength="100" placeholder="Your account name" /></label>
          <div className="form-two"><label>Email address<input name="email" type="email" value={form.email} readOnly autoComplete="email" required placeholder="you@example.com" /></label><label>Phone number<input name="phone" type="tel" value={form.phone} onChange={update} autoComplete="tel" required placeholder="+91 98765 43210" /></label></div>
          <div className="form-section-title">Rental dates</div>
          <div className="form-two"><label>Pickup date<input name="pickupDate" type="date" min={localDate(today)} value={form.pickupDate} onChange={update} required /></label><label>Return date<input name="returnDate" type="date" min={form.pickupDate || localDate(today)} value={form.returnDate} onChange={update} required /></label></div>
          <label>Additional notes <textarea name="notes" value={form.notes} onChange={update} rows="3" maxLength="500" placeholder="Share any relevant details (optional)" /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-wide" type="submit">Submit booking request <CalendarDays size={17} /></button>
          <p className="fine-print">Your booking is checked against live reservations on the DriveX server. Payment is not collected in this version.</p>
        </form>
      </section>
      <aside className="booking-summary"><img src={vehicle.image} alt={vehicle.name} /><span className="eyebrow">YOUR SELECTED VEHICLE</span><h3>{vehicle.name}</h3><p>{vehicle.category} · {vehicle.transmission}</p><div className="summary-line"><span>Daily rate</span><strong>{vehicle.pricePerDay.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</strong></div><div className="summary-line"><span>Rental days</span><strong>{days || "—"}</strong></div><div className="summary-total"><span>Estimated total</span><strong>{total.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</strong></div><p className="fine-print">Estimate excludes taxes, deposits, insurance and any other fees. Final terms would be set by a real rental operator.</p></aside>
    </div>
  </main>;
}
