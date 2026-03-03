import React, { useState } from "react";
import api from "../api/axios";

function NearbyPharmacyPage() {
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");

  const loadNearby = () => {
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { data } = await api.get("/pharmacy/nearby-pharmacies", {
            params: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          });
          setRows(data.data || []);
        } catch (error) {
          setMessage(error.response?.data?.message || "Could not load nearby pharmacies");
        }
      },
      async () => {
        try {
          const { data } = await api.get("/pharmacy/nearby-pharmacies");
          setRows(data.data || []);
        } catch (error) {
          setMessage(error.response?.data?.message || "Could not load nearby pharmacies");
        }
      }
    );
  };

  return (
    <div className="card">
      <h2>Nearby Pharmacies</h2>
      <button className="btn" onClick={loadNearby}>
        Find Nearby
      </button>
      {message && <p className="message">{message}</p>}
      <div className="list">
        {rows.map((item) => (
          <div className="list-item" key={item.id}>
            <h3>{item.name}</h3>
            <p>Distance: {item.distance_km} km</p>
            <p>{item.open_24x7 ? "Open 24/7" : "Limited hours"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NearbyPharmacyPage;
