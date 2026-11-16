import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">📋</span>
        <span className="brand-text">Supervision Survey</span>
      </div>

      <ul className="navbar-links">
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            🏠 Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/survey"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            📝 Survey
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            📊 Dashboard
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
