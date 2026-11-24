import { CarFront, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-about">
          <Link to="/" className="logo"><span className="logo-mark"><CarFront size={22} /></span><span>Drive<span className="accent-text">X</span></span></Link>
          <p>Find your drive. Own the journey. Discover a better way to plan your next ride.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/fleet">Our fleet</Link>
          <Link to="/bookings">My bookings</Link>
          <Link to="/admin">Administration</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <a href="mailto:hello@drivex.example"><Mail size={15} /> hello@drivex.example</a>
          <span><MapPin size={15} /> Mumbai, India (sample location)</span>
        </div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} DriveX. Portfolio demonstration.</span><span>React + Express + SQLite</span></div>
    </footer>
  );
}
