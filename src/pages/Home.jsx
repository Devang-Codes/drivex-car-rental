import { ArrowRight, BadgeCheck, CalendarDays, CarFront, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import VehicleCard from "../components/VehicleCard.jsx";

export default function Home() {
  const { vehicles } = useApp();
  const featured = vehicles.slice(0, 3);

  return (
    <>
      <main>
        <section className="hero container">
          <div className="hero-copy">
            <span className="eyebrow"><Sparkles size={14} /> THE DRIVE, REDEFINED</span>
            <h1>Find your drive.<br /><em>Own the journey.</em></h1>
            <p className="hero-lead">The right car makes every plan feel like an adventure. Explore a considered collection of vehicles for wherever the road takes you.</p>
            <div className="hero-actions"><Link to="/fleet" className="button">Explore the fleet <ArrowRight size={17} /></Link><a href="#how-it-works" className="button button-ghost">How it works</a></div>
            <div className="hero-assurance"><span><BadgeCheck size={16} /> Clear daily rates</span><span><ShieldCheck size={16} /> Simple booking requests</span></div>
          </div>
          <div className="hero-visual">
            <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1500&q=90" alt="Sports car on a scenic road" />
            <div className="hero-image-note"><span>DRIVE SOMETHING SPECIAL</span><strong>Make the miles memorable.</strong></div>
            <div className="hero-floating"><CarFront size={19} /><span><b>{vehicles.length} vehicles</b><small>in our fleet</small></span></div>
          </div>
        </section>

        <section className="trust-strip"><div className="container trust-items"><span>CURATED VEHICLE COLLECTION</span><span>TRANSPARENT DAILY PRICING</span><span>BOOKING HISTORY</span><span>RESPONSIVE EXPERIENCE</span></div></section>

        <section className="section container">
          <div className="section-heading"><div><span className="eyebrow">THE COLLECTION</span><h2>Choose your kind of drive.</h2><p>Explore a selection of vehicles for every kind of plan.</p></div><Link to="/fleet" className="text-link">View all vehicles <ArrowRight size={16} /></Link></div>
          <div className="vehicle-grid">{featured.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div>
        </section>

        <section className="feature-band" id="how-it-works"><div className="container feature-layout"><div><span className="eyebrow">A BETTER WAY TO BOOK</span><h2>Three steps.<br /><em>One great journey.</em></h2><p>Find a vehicle, choose your dates and send a booking request. Your rental estimate is calculated before you submit.</p><Link to="/fleet" className="button">Find your vehicle <ArrowRight size={17} /></Link></div><div className="steps-list"><div className="step"><b>01</b><span><strong>Choose your car</strong><small>Compare vehicle types, features and daily rates.</small></span><CarFront /></div><div className="step"><b>02</b><span><strong>Plan your dates</strong><small>Select pickup and return dates to see an estimate.</small></span><CalendarDays /></div><div className="step"><b>03</b><span><strong>Send your request</strong><small>Save the request and follow its status in your bookings.</small></span><BadgeCheck /></div></div></div></section>

        <section className="section container benefit-section"><div className="section-heading"><div><span className="eyebrow">THE DRIVEX DIFFERENCE</span><h2>Details that make it simpler.</h2><p>A straightforward experience from discovery to booking request.</p></div></div><div className="benefit-grid"><article><span>01</span><h3>Thoughtful choice</h3><p>Browse a curated sample fleet with clear specifications and categories.</p></article><article><span>02</span><h3>Upfront estimates</h3><p>See the daily rate and estimated rental total before submitting a request.</p></article><article><span>03</span><h3>One place to manage</h3><p>Review your reservations and manage fleet operations in the admin workspace.</p></article></div></section>
      </main>
    </>
  );
}
