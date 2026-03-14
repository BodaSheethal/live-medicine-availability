import React, { useState } from "react";
import api from "../api/axios";

function NearbyPharmacyPage() {
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50);
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  const mapsLink = (lat, lng) => {
    const la = Number(lat);
    const lo = Number(lng);
    if (!Number.isFinite(la) || !Number.isFinite(lo)) return null;
    if (la === 0 && lo === 0) return null;
    return `https://www.google.com/maps?q=${encodeURIComponent(`${la},${lo}`)}`;
  };

  const loadNearby = () => {
    setMessage("");
    setLoading(true);
    setRows([]);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { data } = await api.get("/pharmacy/nearby-pharmacies", {
            params: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              maxDistance,
              emergency: emergencyOnly,
            },
          });
          setRows(data.data || []);
          if (!(data.data || []).length) {
            setMessage(`No pharmacies found within ${maxDistance} km. Try increasing the distance.`);
          }
        } catch (error) {
          setMessage(error.response?.data?.message || "Could not load nearby pharmacies");
        } finally {
          setLoading(false);
        }
      },
      async () => {
        try {
          const { data } = await api.get("/pharmacy/nearby-pharmacies", {
            params: { maxDistance, emergency: emergencyOnly },
          });
          setRows(data.data || []);
          if (!(data.data || []).length) {
            setMessage(`No pharmacies found within ${maxDistance} km. Try increasing the distance.`);
          }
        } catch (error) {
          setMessage(error.response?.data?.message || "Could not load nearby pharmacies");
        } finally {
          setLoading(false);
        }
      }
    );
  };

  return (
    <div className="card">
      <h2>Nearby Pharmacies</h2>
      <div className="filters">
        <input
          type="number"
          min="1"
          placeholder="Max Distance (km)"
          value={maxDistance}
          onChange={(e) => setMaxDistance(Number(e.target.value || 50))}
        />
        <label className="availability-toggle">
          <input
            type="checkbox"
            checked={emergencyOnly}
            onChange={(e) => setEmergencyOnly(e.target.checked)}
          />
          24/7 only
        </label>
        <button className="btn" onClick={loadNearby} disabled={loading}>
          {loading ? "Finding..." : "Find Nearby"}
        </button>
      </div>
      {message && <p className="message">{message}</p>}
      <div className="list">
        {rows.map((item) => (
          <div className="list-item" key={item.id}>
            <h3>{item.name}</h3>
            <p>
              Distance:{" "}
              {item.distance_km === null || item.distance_km === undefined
                ? "Location not set"
                : `${item.distance_km} km`}
            </p>
            <p>{item.open_24x7 ? "Open 24/7" : "Limited hours"}</p>
            {mapsLink(item.latitude, item.longitude) && (
              <p>
                <a
                  href={mapsLink(item.latitude, item.longitude)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View on map
                </a>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NearbyPharmacyPage;
