import React from "react";
import { Link } from "react-router-dom";

export const Header: React.FC = () => (
  <nav className="navbar">
    <div className="navbar-brand">
      <Link className="navbar-item" to="/">
        なろうランキング
      </Link>
    </div>

    <div id="navbarBasicExample" className="navbar-menu">
      <div className="navbar-start">
      <Link className="navbar-item" to="/ranking/d">日間</Link>
      <Link className="navbar-item" to="/ranking/w">週間</Link>
      <Link className="navbar-item" to="/ranking/m">月間</Link>
      </div>
    </div>
  </nav>
);
