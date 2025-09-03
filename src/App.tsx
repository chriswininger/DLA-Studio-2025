import './App.css'
import './tabs/tabs.css'
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import Simple2DAnimatedDLA from './tabs/Simple2DAnimatedDLA/simple-2d-animated-dla'
import { SVGDLA } from './tabs/SVGDLA/svg-dla'
import DistanceGradient from './tabs/DistanceGradient/distance-gradient';
import About from './tabs/About/about';
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

  // Dispatch event when app is ready for pre-rendering
  useEffect(() => {
    // Wait a bit for all components to render
    const timer = setTimeout(() => {
      document.dispatchEvent(new Event('app-ready'));
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <nav className="dlasim_tab-nav">
        <NavLink to="/simple-2d-animated-dla" className={({ isActive }) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>
          Simulation
        </NavLink>
        <NavLink to="/distance-gradient" className={({ isActive }) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>
          Gradient
        </NavLink>
        <NavLink to="/svg-dla" className={({ isActive }) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>
          SVG
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>
          <FontAwesomeIcon icon={faCircleQuestion} className="dlasim_tab-icon" />
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/about" replace />} />
        <Route path="/simple-2d-animated-dla" element={<Simple2DAnimatedDLA />} />
        <Route path="/distance-gradient" element={<DistanceGradient />} />
        <Route path="/svg-dla" element={<SVGDLA />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}

export default App
