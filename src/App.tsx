import './App.css'
import './tabs/tabs.css'
import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom';
import Simple2DAnimatedDLA from './tabs/Simple2DAnimatedDLA/simple-2d-animated-dla'
import { SVGDLA } from './tabs/SVGDLA/svg-dla'
import DistanceGradient from './tabs/DistanceGradient/distance-gradient';
import About from './tabs/About/about';
import ThreeDimensionalDLA from './tabs/three-dimensional-dla/three-dimensional-dla';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import {PageTracker} from "./analytics/page-tracker.ts";
import { useNavigation } from './navigation/use-navigation';

function App() {
  return (
    <Router basename="/">
      <PageTracker />
      <Tabs />
    </Router>
  )
}

function Tabs() {
  useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, handleClickOutside]);

  const navLinks = (
    <>
      <NavLink to="/simple-2d-animated-dla" className={({ isActive }) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>
        Simulation
      </NavLink>
      <NavLink to="/distance-gradient" className={({ isActive }) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>
        Gradient
      </NavLink>
      <NavLink to="/svg-dla" className={({ isActive }) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>
        SVG
      </NavLink>
      <NavLink to="/3d-dla" className={({ isActive }) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>
        3D
      </NavLink>
      <NavLink to="/about" className={({ isActive }) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>
        <FontAwesomeIcon icon={faCircleQuestion} className="dlasim_tab-icon" />
      </NavLink>
    </>
  );

  return (
    <div>
      <nav className="dlasim_tab-nav">
        {navLinks}
      </nav>

      <div className="dlasim-mobile-nav" ref={menuRef}>
        <button
          className={`dlasim-hamburger-btn${menuOpen ? ' dlasim-hamburger-open' : ''}`}
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="Toggle navigation menu"
        >
          <span className="dlasim-hamburger-line" />
          <span className="dlasim-hamburger-line" />
          <span className="dlasim-hamburger-line" />
        </button>
        {menuOpen && (
          <nav className="dlasim-mobile-menu">
            {navLinks}
          </nav>
        )}
      </div>

      <div className="dlasim-content">
        <Routes>
          <Route path="/" element={<Navigate to="/about" replace />} />
          <Route path="/simple-2d-animated-dla" element={<Simple2DAnimatedDLA />} />
          <Route path="/distance-gradient" element={<DistanceGradient />} />
          <Route path="/svg-dla" element={<SVGDLA />} />
          <Route path="/3d-dla" element={<ThreeDimensionalDLA />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </div>
  );
}

export default App
