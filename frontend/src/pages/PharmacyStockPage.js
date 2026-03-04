import React, { useEffect, useState } from "react";
import api from "../api/axios";

function PharmacyStockPage() {
  const [pharmacy, setPharmacy] = useState(null);
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("Loading stock data...");
  const [stockFilter, setStockFilter] = useState("all");
  const [nameFilter, setNameFilter] = useState("");
  const [addForm, setAddForm] = useState({
    medicineName: "",
    category: "",
    stock: "",
    price: "",
  });
  const [updateForm, setUpdateForm] = useState({
    medicineId: "",
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
        medicineName: addForm.medicineName,
        category: addForm.category,
        stock: Number(addForm.stock),
        price: Number(addForm.price),
      });
      setAddForm({ medicineName: "", category: "", stock: "", price: "" });
      setMessage("Medicine added successfully.");
      await loadStock();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not add medicine");
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/pharmacy/update-stock", {
        medicineId: Number(updateForm.medicineId),
        stock: Number(updateForm.stock),
        price: Number(updateForm.price),
      });
      setUpdateForm({ medicineId: "", stock: "", price: "" });
      setMessage("Stock updated successfully.");
      await loadStock();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update stock");
    }
  };

  const filteredRows = rows.filter((item) => {
    const matchesName = item.medicine_name.toLowerCase().includes(nameFilter.toLowerCase().trim());
    if (stockFilter === "in") return matchesName && item.available;
    if (stockFilter === "out") return matchesName && !item.available;
    return matchesName;
  });

  return (
    <div className="card">
      <h2>Pharmacy Stock Dashboard</h2>
      {pharmacy && <p>Pharmacy: {pharmacy.name}</p>}

      <section className="section-block">
        <h3>Current Stock</h3>
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
      </section>

      <section className="section-block">
        <form onSubmit={handleAddMedicine} className="form">
          <h3>Add New Medicine</h3>
          <input
            placeholder="Medicine Name"
            value={addForm.medicineName}
            onChange={(e) => setAddForm({ ...addForm, medicineName: e.target.value })}
            required
          />
          <input
            placeholder="Category"
            value={addForm.category}
            onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
            required
          />
          <input
            placeholder="Quantity (stock)"
            type="number"
            value={addForm.stock}
            onChange={(e) => setAddForm({ ...addForm, stock: e.target.value })}
            required
          />
          <input
            placeholder="Price"
            type="number"
            value={addForm.price}
            onChange={(e) => setAddForm({ ...addForm, price: e.target.value })}
            required
          />
          <button className="btn" type="submit">
            Add Medicine
          </button>
        </form>
      </section>

      <section className="section-block">
        <form onSubmit={handleUpdateStock} className="form">
          <h3>Update Existing Stock</h3>
          <select
            value={updateForm.medicineId}
            onChange={(e) => setUpdateForm({ ...updateForm, medicineId: e.target.value })}
            required
          >
            <option value="">Select medicine</option>
            {rows.map((item) => (
              <option key={item.medicine_id} value={item.medicine_id}>
                {item.medicine_name}
              </option>
            ))}
          </select>
          <input
            placeholder="New Quantity (stock)"
            type="number"
            value={updateForm.stock}
            onChange={(e) => setUpdateForm({ ...updateForm, stock: e.target.value })}
            required
          />
          <input
            placeholder="New Price"
            type="number"
            value={updateForm.price}
            onChange={(e) => setUpdateForm({ ...updateForm, price: e.target.value })}
            required
          />
          <button className="btn secondary" type="submit">
            Update Stock
          </button>
        </form>
      </section>

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default PharmacyStockPage;
