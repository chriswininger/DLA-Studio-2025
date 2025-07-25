import './App.css'
import './tabs/tabs.css'
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import Simple2DAnimatedDLA from './tabs/Simple2DAnimatedDLA/simple-2d-animated-dla'
import { SVGDLA } from './tabs/SVGDLA/SVGDLA'
import DistanceGradient from './tabs/DistanceGradient/distance-gradient';

function App() {
  return (
    <Router basename="/DLA-Studio-2025">
      {/* <RedirectHandler /> */}
      <div>
        <nav className="dlasim_tab-nav">
          <NavLink to="/simple-2d-animated-dla" className={({ isActive }) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>
            Simple DLA (TEST)
          </NavLink>
          <NavLink to="/distance-gradient" className={({ isActive }) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>
            Distance Gradient
            </NavLink>
          <NavLink to="/svg-dla" className={({ isActive }) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>
            SVG DLA
          </NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<Navigate to="/simple-2d-animated-dla" replace />} />
          <Route path="/simple-2d-animated-dla" element={<Simple2DAnimatedDLA />} />
          <Route path="/distance-gradient" element={<DistanceGradient />} />
          <Route path="/svg-dla" element={<SVGDLA />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
