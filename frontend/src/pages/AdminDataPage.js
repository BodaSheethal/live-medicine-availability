import React, { useEffect, useState } from "react";
import api from "../api/axios";

function AdminDataPage() {
  const [users, setUsers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [message, setMessage] = useState("Loading admin data...");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersRes, medicinesRes, pharmaciesRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/medicines"),
          api.get("/admin/pharmacies"),
        ]);
        setUsers(usersRes.data.data || []);
        setMedicines(medicinesRes.data.data || []);
        setPharmacies(pharmaciesRes.data.data || []);
        setMessage("");
      } catch (error) {
        setMessage(error.response?.data?.message || "Failed to load admin data");
      }
    };

    loadData();
  }, []);

  return (
    <div className="card">
      <h2>Admin Data Viewer</h2>
      <p>Only admin users can access this page.</p>
      {message && <p className="message">{message}</p>}

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
    </div>
  );
}

export default AdminDataPage;
