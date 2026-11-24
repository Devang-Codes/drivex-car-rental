import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import VehicleCard from "../components/VehicleCard.jsx";
import { useApp } from "../context/AppContext.jsx";

const filters = ["All", "Luxury", "Sports", "SUV", "Sedan"];

export default function Fleet() {
  const { vehicles } = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("recommended");

  const filtered = useMemo(() => {
    let result = vehicles.filter((vehicle) => {
      const text = `${vehicle.name} ${vehicle.brand} ${vehicle.category}`.toLowerCase();
      const matchesText = text.includes(query.toLowerCase().trim());
      const matchesCategory = category === "All" || vehicle.category === category;
      return matchesText && matchesCategory;
    });
    if (sort === "low") result = [...result].sort((a, b) => a.pricePerDay - b.pricePerDay);
    if (sort === "high") result = [...result].sort((a, b) => b.pricePerDay - a.pricePerDay);
    if (sort === "name") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [vehicles, query, category, sort]);

  return <main className="page-main container">
    <div className="page-heading"><span className="eyebrow">THE DRIVEX COLLECTION</span><h1>Find the right <em>ride.</em></h1><p>Search the fleet, compare the details and choose a vehicle for your next plan.</p></div>
    <div className="fleet-toolbar">
      <label className="search-field"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search make, model or category" aria-label="Search vehicles" /></label>
      <label className="sort-field"><SlidersHorizontal size={17} /><span>Sort</span><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="recommended">Recommended</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name</option></select></label>
    </div>
    <div className="filter-row">{filters.map((item) => <button key={item} className={`filter-chip ${category === item ? "selected" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}</div>
    <div className="results-line">{filtered.length} vehicle{filtered.length === 1 ? "" : "s"} found</div>
    {filtered.length ? <div className="vehicle-grid">{filtered.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}</div> : <div className="empty-state"><Search size={30} /><h2>No vehicles match that search</h2><p>Try another search term or clear the category filter.</p><button className="button button-ghost" onClick={() => { setQuery(""); setCategory("All"); }}>Clear filters</button></div>}
  </main>;
}
