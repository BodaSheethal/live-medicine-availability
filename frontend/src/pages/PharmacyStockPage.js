import React, { useEffect, useState } from "react";
import api from "../api/axios";

function PharmacyStockPage() {
  const [pharmacy, setPharmacy] = useState(null);
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("Loading stock data...");
  const [stockFilter, setStockFilter] = useState("all");
  const [nameFilter, setNameFilter] = useState("");

  const loadStock = async () => {
    try {
      const { data } = await api.get("/pharmacy/my-stock");
      setPharmacy(data.pharmacy || null);
      setRows(data.data || []);
      setMessage((data.data || []).length ? "" : "No medicines found in your stock dataset.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load pharmacy stock");
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  const filteredRows = rows.filter((item) => {
    const matchesName = item.medicine_name.toLowerCase().includes(nameFilter.toLowerCase().trim());
    if (stockFilter === "in") return matchesName && item.available;
    if (stockFilter === "out") return matchesName && !item.available;
    return matchesName;
  });

  return (
    <div className="card">
      <h2>My Stock</h2>
      {pharmacy && <p>Pharmacy: {pharmacy.name}</p>}

      <div className="stock-toolbar">
        <p className="stock-count">
          Total Medicines: <strong>{rows.length}</strong> | In Stock:{" "}
          <strong>{rows.filter((r) => r.available).length}</strong> | Out of Stock:{" "}
          <strong>{rows.filter((r) => !r.available).length}</strong>
        </p>
        <div className="stock-filters">
          <input
            placeholder="Search medicine name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="in">In Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="list">
        {filteredRows.map((item) => (
          <div className="list-item" key={item.medicine_id}>
            <h3>{item.medicine_name}</h3>
            <p>Category: {item.category}</p>
            <p>Price: Rs. {Number(item.price).toFixed(2)}</p>
            <p>Stock: {item.stock}</p>
            <p className={item.available ? "in-stock" : "out-stock"}>
              {item.available ? "Available" : "Out of stock"}
            </p>
          </div>
        ))}
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default PharmacyStockPage;
