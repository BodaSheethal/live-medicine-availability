import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="home-hero">
      <div className="home-hero-content">
        <p className="home-tag">Healthcare Location Service</p>
        <h1>Live Medicine Availability Finder</h1>
        <p className="home-subtitle">
          Find nearby pharmacies with live stock status, price, quantity, and distance in seconds.
        </p>
        <div className="actions">
          <Link className="btn" to="/search">
            Search Medicines
          </Link>
          <Link className="btn secondary" to="/emergency">
            Emergency Mode
          </Link>
        </div>
      </div>

      <div className="home-features">
        <div className="feature-card">
          <h3>Live Stock</h3>
          <p>Check availability before visiting the pharmacy.</p>
        </div>
        <div className="feature-card">
          <h3>Nearby Results</h3>
          <p>Distance-aware search using your location.</p>
        </div>
        <div className="feature-card">
          <h3>Emergency 24/7</h3>
          <p>Quickly find open pharmacies during urgent situations.</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
