import React, { useEffect, useState } from "react";
import api from "../api/axios";

function PharmacyProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ latitude: "", longitude: "", open_24x7: false });
  const [message, setMessage] = useState("Loading profile...");

  const loadProfile = async () => {
    try {
      const { data } = await api.get("/pharmacy/my-profile");
      setProfile(data);
      setForm({
        latitude: data.pharmacy?.latitude ?? "",
        longitude: data.pharmacy?.longitude ?? "",
        open_24x7: Boolean(data.pharmacy?.open_24x7),
      });
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load profile");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const useMyLocation = () => {
    setMessage("");
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: String(pos.coords.latitude),
          longitude: String(pos.coords.longitude),
        }));
      },
      () => setMessage("Could not fetch your current location. Please allow location permission.")
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.put("/pharmacy/my-profile", {
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        open_24x7: Boolean(form.open_24x7),
      });
      setMessage("Location saved. Users can now find your pharmacy on the map.");
      await loadProfile();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not save location");
    }
  };

  return (
    <div className="card">
      <h2>Pharmacy Profile</h2>
      <p>Set your pharmacy location so users can locate you.</p>

      {profile?.user && (
        <div className="section-block">
          <p>
            <strong>Store:</strong> {profile.user.pharmacyStoreName || profile.user.name}
          </p>
          <p>
            <strong>Verification:</strong> {profile.user.pharmacyVerificationStatus}
          </p>
        </div>
      )}

      <div className="section-block">
        <button type="button" className="btn secondary" onClick={useMyLocation}>
          Use My Current Location
        </button>
        <p className="muted">
          Tip: You can also open Google Maps, right-click your shop, and copy the latitude/longitude.
        </p>

        <form className="form" onSubmit={handleSave}>
          <input
            type="number"
            step="any"
            placeholder="Latitude (e.g., 12.9716)"
            value={form.latitude}
            onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))}
            required
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude (e.g., 77.5946)"
            value={form.longitude}
            onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))}
            required
          />
          <label className="availability-toggle">
            <input
              type="checkbox"
              checked={form.open_24x7}
              onChange={(e) => setForm((prev) => ({ ...prev, open_24x7: e.target.checked }))}
            />
            Open 24/7
          </label>
          <button className="btn" type="submit">
            Save Profile
          </button>
        </form>
      </div>

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default PharmacyProfilePage;
