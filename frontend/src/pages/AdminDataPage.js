import React, { useEffect, useState } from "react";
import api from "../api/axios";

function AdminDataPage() {
  const [users, setUsers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [pharmacyFullDetails, setPharmacyFullDetails] = useState([]);
  const [medicineQuery, setMedicineQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [message, setMessage] = useState("Loading admin data...");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, medicinesRes, pharmaciesRes, fullRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/medicines"),
          api.get("/admin/pharmacies"),
          api.get("/admin/pharmacy-full-details"),
        ]);
        setUsers(usersRes.data.data || []);
        setMedicines(medicinesRes.data.data || []);
        setPharmacies(pharmaciesRes.data.data || []);
        setPharmacyFullDetails(fullRes.data.data || []);
        setMessage("");
      } catch (error) {
        setMessage(error.response?.data?.message || "Failed to load admin data");
      }
    };

    loadData();
  }, []);

  const handleMedicineSearch = async (e) => {
    e.preventDefault();
    setSearchMessage("");
    setSearchResults([]);

    if (!medicineQuery.trim()) {
      setSearchMessage("Enter medicine name");
      return;
    }

    try {
      const { data } = await api.get(
        `/medicine/search-medicine?name=${encodeURIComponent(medicineQuery.trim())}`
      );
      setSearchResults(data.data || []);
      if (!data.data?.length) {
        setSearchMessage("No pharmacy has this medicine in dataset.");
      }
    } catch (error) {
      setSearchMessage(error.response?.data?.message || "Could not search medicine");
    }
  };

  return (
    <div className="card">
      <h2>Admin Data Viewer</h2>
      <p>Only admin users can access this page.</p>
      {message && <p className="message">{message}</p>}

      <h3>Medicine Availability Search (Pharmacy-wise)</h3>
      <form className="form inline" onSubmit={handleMedicineSearch}>
        <input
          placeholder="Enter medicine name"
          value={medicineQuery}
          onChange={(e) => setMedicineQuery(e.target.value)}
        />
        <button className="btn" type="submit">
          Search
        </button>
      </form>
      {searchMessage && <p className="message">{searchMessage}</p>}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Pharmacy</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Distance (km)</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((item, idx) => (
              <tr key={`${item.medicine_id}-${item.pharmacy_name}-${idx}`}>
                <td>{item.medicine_name}</td>
                <td>{item.pharmacy_name}</td>
                <td>{item.stock}</td>
                <td>{item.price}</td>
                <td>{item.distance_km}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Users</h3>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Medicines</h3>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td>{m.name}</td>
                <td>{m.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Pharmacies</h3>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>24/7</th>
              <th>Owner Email</th>
            </tr>
          </thead>
          <tbody>
            {pharmacies.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.open_24x7 ? "Yes" : "No"}</td>
                <td>{p.owner_email || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Pharmacy Full Details (with Medicines)</h3>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Pharmacy</th>
              <th>Owner</th>
              <th>Verified</th>
              <th>License</th>
              <th>Medicine</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {pharmacyFullDetails.map((p, idx) => (
              <tr key={`${p.pharmacy_id}-${p.medicine_id || "na"}-${idx}`}>
                <td>{p.pharmacy_name}</td>
                <td>{p.owner_email || "-"}</td>
                <td>{p.pharmacy_verified ? "Yes" : "No"}</td>
                <td>{p.pharmacy_license_no || "-"}</td>
                <td>{p.medicine_name || "-"}</td>
                <td>{p.category || "-"}</td>
                <td>{p.stock ?? "-"}</td>
                <td>{p.price ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDataPage;
