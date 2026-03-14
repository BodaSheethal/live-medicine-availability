import React, { useEffect, useState } from "react";
import api from "../api/axios";

function NearbyPharmacyPage() {
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  // Keep a generous default so users actually see pharmacies without tweaking inputs.
  const maxDistance = 500;

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
            },
          });
          setRows(data.data || []);
          if (!(data.data || []).length) {
            setMessage("No nearby pharmacies found. Ask pharmacies to set their location in Profile.");
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
            params: { maxDistance },
          });
          setRows(data.data || []);
          if (!(data.data || []).length) {
            setMessage("No nearby pharmacies found. Ask pharmacies to set their location in Profile.");
          }
        } catch (error) {
          setMessage(error.response?.data?.message || "Could not load nearby pharmacies");
        } finally {
          setLoading(false);
        }
      }
    );
  };

  useEffect(() => {
    loadNearby();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="card">
      <h2>Nearby Pharmacies</h2>
      <button className="btn" onClick={loadNearby} disabled={loading}>
        {loading ? "Finding..." : "Refresh"}
      </button>
      {message && <p className="message">{message}</p>}
      <div className="list">
        {rows.map((item) => (
          <div className="list-item" key={item.id}>
            <h3>{item.name}</h3>
            <p>
              Distance:{" "}
              {item.distance_km === null || item.distance_km === undefined
                ? "Location not set"
                : `${item.distance_km} away`}
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
