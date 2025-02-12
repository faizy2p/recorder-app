import { NavLink } from "react-router-dom";
import { useState } from "react";
import './App.css';

const Navbar = () => {
    return (
        <nav className="navbar">
        <h1>Recorder</h1>
        <button className="margin-right-30 border-white">
            <NavLink to="/">Voice Recorder</NavLink>
        </button>
        <button className="margin-30 border-white">
            <NavLink to="/camcorder">Cam corder</NavLink>
        </button>
        </nav>
    );
    }
export default Navbar;