import React, { useEffect, useState } from "react";
import api from "../api/axios";

function PharmacyStockPage() {
  const [pharmacy, setPharmacy] = useState(null);
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("Loading stock data...");
  const [form, setForm] = useState({
    medicineName: "",
    category: "",
    stock: "",
    price: "",
  });

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

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/pharmacy/add-medicine", {
        medicineName: form.medicineName,
        category: form.category,
        stock: Number(form.stock),
        price: Number(form.price),
      });
      setForm({ medicineName: "", category: "", stock: "", price: "" });
      setMessage("Medicine saved successfully.");
      await loadStock();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not add medicine");
    }
  };

  return (
    <div className="card">
      <h2>Pharmacy Stock Dashboard</h2>
      {pharmacy && <p>Pharmacy: {pharmacy.name}</p>}

      <form onSubmit={handleAddMedicine} className="form">
        <h3>Add / Update Medicine</h3>
        <input
          placeholder="Medicine Name"
          value={form.medicineName}
          onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
          required
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        />
        <input
          placeholder="Quantity (stock)"
          type="number"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          required
        />
        <input
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <button className="btn" type="submit">
          Save Medicine
        </button>
      </form>

      {message && <p className="message">{message}</p>}

      <div className="list">
        {rows.map((item) => (
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
    </div>
  );
}

export default PharmacyStockPage;
