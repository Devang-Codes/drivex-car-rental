import { ArrowLeft, CalendarDays, Check, Fuel, Gauge, MapPin, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";

export default function VehicleDetails() {
  const { id } = useParams();
  const { vehicles } = useApp();
  const vehicle = vehicles.find((item) => item.id === id);

  if (!vehicle) return <main className="container page-main"><div className="empty-state"><h2>Vehicle not found</h2><p>This vehicle may have been removed from the demo fleet.</p><Link to="/fleet" className="button">Back to fleet</Link></div></main>;

  return <main className="container page-main">
    <Link to="/fleet" className="back-link"><ArrowLeft size={16} /> Back to fleet</Link>
    <div className="details-layout">
      <div className="details-image"><img src={vehicle.image} alt={vehicle.name} /></div>
      <div className="details-content">
        <span className="eyebrow">{vehicle.brand} · {vehicle.year} · {vehicle.category}</span>
        <h1>{vehicle.name}</h1>
        <p className="details-description">{vehicle.description}</p>
        <div className="details-price"><strong>{vehicle.pricePerDay.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</strong><span>per day · sample rate</span></div>
        <div className="details-specs"><span><Users /> {vehicle.seats} seats</span><span><Gauge /> {vehicle.transmission}</span><span><Fuel /> {vehicle.fuel}</span><span><MapPin /> {vehicle.location}</span></div>
        <h3>Vehicle highlights</h3><ul className="feature-list">{vehicle.features.map((feature) => <li key={feature}><Check size={16} /> {feature}</li>)}</ul>
        <Link to={`/book/${vehicle.id}`} className="button button-wide">Request this vehicle <CalendarDays size={17} /></Link>
        <p className="fine-print">Your booking request is checked against server-side vehicle reservations. Approval is handled by the DriveX rental administrator.</p>
      </div>
    </div>
  </main>;
}
