import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

function PharmacySearchStockPage() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [message, setMessage] = useState("Loading stock data...");

  useEffect(() => {
    const loadStock = async () => {
      try {
        const { data } = await api.get("/pharmacy/my-stock");
        setRows(data.data || []);
        setMessage((data.data || []).length ? "" : "No medicines found in your stock dataset.");
      } catch (error) {
        setMessage(error.response?.data?.message || "Could not load pharmacy stock");
      }
    };
    loadStock();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((item) => {
      const matchesName = item.medicine_name.toLowerCase().includes(search.toLowerCase().trim());
      if (stockFilter === "in") return matchesName && item.available;
      if (stockFilter === "out") return matchesName && !item.available;
      return matchesName;
    });
  }, [rows, search, stockFilter]);

  return (
    <div className="card">
      <h2>Search Stock</h2>
      <div className="stock-filters">
        <input
          placeholder="Search medicine name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="in">In Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      <p className="stock-count">
        Results: <strong>{filteredRows.length}</strong>
      </p>

      <div className="list">
        {filteredRows.map((item) => (
          <div className="list-item" key={item.medicine_id}>
            <h3>{item.medicine_name}</h3>
            <p>Stock: {item.stock}</p>
            <p>Price: Rs. {Number(item.price).toFixed(2)}</p>
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

export default PharmacySearchStockPage;
