import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2>Live Medicine Finder</h2>
      <div className="nav-links">
        <Link to="/">Home</Link>
        {!token ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to="/search">Search</Link>
            <Link to="/nearby">Nearby</Link>
            <Link to="/emergency">Emergency</Link>
            {user.role === "admin" && <Link to="/admin">Admin</Link>}
            <button type="button" onClick={handleLogout} className="link-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
