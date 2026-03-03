import React, { useMemo, useState } from "react";
import api from "../api/axios";

function MedicineSearchPage() {
  const [name, setName] = useState("");
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({ maxPrice: "", maxDistance: "", onlyAvailable: false });

  const searchMedicine = async (e) => {
    e.preventDefault();
    setMessage("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const { data } = await api.get("/medicine/search-medicine", {
            params: { name, lat, lng },
          });
          setRows(data.data || []);
          if ((data.data || []).length === 0) setMessage("No medicine found");
        } catch (error) {
          setMessage(error.response?.data?.message || "Search failed");
        }
      },
      async () => {
        try {
          const { data } = await api.get("/medicine/search-medicine", { params: { name } });
          setRows(data.data || []);
        } catch (error) {
          setMessage(error.response?.data?.message || "Search failed");
        }
      }
    );
  };

  const filteredRows = useMemo(() => {
    return rows.filter((item) => {
      const byPrice = !filters.maxPrice || Number(item.price) <= Number(filters.maxPrice);
      const byDistance = !filters.maxDistance || Number(item.distance_km) <= Number(filters.maxDistance);
      const byAvailability = !filters.onlyAvailable || Number(item.stock) > 0;
      return byPrice && byDistance && byAvailability;
    });
  }, [rows, filters]);

  return (
    <div className="search-page">
      <div className="search-header">
        <p className="home-tag">Smart Medicine Search</p>
        <h2>Find Medicine Availability Nearby</h2>
        <p>Search by medicine name and filter by price, distance, and stock availability.</p>
      </div>

      <div className="card search-card">
        <form onSubmit={searchMedicine} className="form inline">
          <input
            placeholder="Enter medicine name (e.g., Paracetamol)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button className="btn" type="submit">
            Search
          </button>
        </form>

        <div className="filters search-filters">
          <input
            placeholder="Max Price"
            type="number"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />
          <input
            placeholder="Max Distance (km)"
            type="number"
            value={filters.maxDistance}
            onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value })}
          />
          <label className="availability-toggle">
            <input
              type="checkbox"
              checked={filters.onlyAvailable}
              onChange={(e) => setFilters({ ...filters, onlyAvailable: e.target.checked })}
            />
            In Stock Only
          </label>
        </div>

        {message && <p className="message">{message}</p>}

        <div className="list result-grid">
          {filteredRows.map((item, idx) => (
            <div key={`${item.medicine_id}-${idx}`} className="list-item result-card">
              <h3>{item.medicine_name}</h3>
              <p>Pharmacy: {item.pharmacy_name}</p>
              <p>Price: Rs. {Number(item.price).toFixed(2)}</p>
              <p>Distance: {item.distance_km} km</p>
              <p className={Number(item.stock) > 0 ? "in-stock" : "out-stock"}>
                Stock: {item.stock > 0 ? `${item.stock} available` : "Out of stock"}
              </p>
              {Number(item.stock) > 0 && (
                <p className="notification">Available now. You can visit this pharmacy.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MedicineSearchPage;
