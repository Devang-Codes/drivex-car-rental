import { ArrowUpRight, Fuel, Gauge, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function VehicleCard({ vehicle }) {
  return (
    <article className="vehicle-card">
      <Link to={`/vehicle/${vehicle.id}`} className="vehicle-photo">
        <img src={vehicle.image} alt={vehicle.name} loading="lazy" />
        <span className="photo-tag">{vehicle.category}</span>
        <span className="photo-arrow"><ArrowUpRight size={18} /></span>
      </Link>
      <div className="vehicle-info">
        <div className="vehicle-title-row"><div><p className="eyebrow">{vehicle.brand} · {vehicle.year}</p><h3>{vehicle.name}</h3></div><span className="rating">★ {vehicle.rating}</span></div>
        <div className="spec-row">
          <span><Users size={15} /> {vehicle.seats} seats</span>
          <span><Gauge size={15} /> {vehicle.transmission}</span>
          <span><Fuel size={15} /> {vehicle.fuel}</span>
        </div>
        <div className="vehicle-card-bottom">
          <div><strong>{vehicle.pricePerDay.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</strong><small> / day</small></div>
          <Link to={`/vehicle/${vehicle.id}`} className="text-link">View details <ArrowUpRight size={15} /></Link>
        </div>
      </div>
    </article>
  );
}
