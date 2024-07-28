import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/nav.css';

const Navbar = () => {
  return (
    <nav className="nav-bar">
      <Link to="/channels" className="nav-button">Channels</Link>
      <div className="separator"></div>
      <Link to="/logging" className="nav-button">Logging</Link>
      <div className="separator"></div>
      <Link to="/display" className="nav-button">Display</Link>
    </nav>
  );
};

export default Navbar;
