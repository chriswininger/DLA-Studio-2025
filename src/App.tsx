import './App.css'
import './tabs/tabs.css'
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import Simple2DAnimatedDLA from './tabs/Simple2DAnimatedDLA/simple-2d-animated-dla'
import DrawDLA from './tabs/DrawDLA/draw-dla'
import SVGDLA from './tabs/SVGDLA/SVGDLA'

function App() {
  return (
    <Router>
      <div>
        <nav className="dlasim_tab-nav">
          <NavLink to="/simple-2d-animated-dla" className={({ isActive }) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>Simple DLA</NavLink>
          <NavLink to="/draw-dla" className={({ isActive }) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>Draw DLA</NavLink>
          <NavLink to="/svg-dla" className={({ isActive }) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>SVG DLA</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<Navigate to="/simple-2d-animated-dla" replace />} />
          <Route path="/simple-2d-animated-dla" element={<Simple2DAnimatedDLA />} />
          <Route path="/draw-dla" element={<DrawDLA />} />
          <Route path="/svg-dla" element={<SVGDLA />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
