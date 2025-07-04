import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import Simple2DAnimatedDLA from './tabs/Simple2DAnimatedDLA/simple-2d-animated-dla'
import DrawDLA from './tabs/DrawDLA/DrawDLA'
import SVGDLA from './tabs/SVGDLA/SVGDLA'

function App() {
  return (
    <Router>
      <div>
        <nav className="tab-nav" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', margin: '2rem 0' }}>
          <NavLink to="/simple-2d-animated-dla" className={({ isActive }) => isActive ? 'active' : ''} style={{ color: '#ff00a6', fontSize: '1.2rem', border: '2px solid #5a6cff', borderRadius: '6px', padding: '0.5rem 2rem', textDecoration: 'none', marginRight: '1rem' }}>Simple DLA</NavLink>
          <NavLink to="/draw-dla" className={({ isActive }) => isActive ? 'active' : ''} style={{ color: '#ff00a6', fontSize: '1.2rem', border: '2px solid #5a6cff', borderRadius: '6px', padding: '0.5rem 2rem', textDecoration: 'none', marginRight: '1rem' }}>Draw DLA</NavLink>
          <NavLink to="/svg-dla" className={({ isActive }) => isActive ? 'active' : ''} style={{ color: '#ff00a6', fontSize: '1.2rem', border: '2px solid #5a6cff', borderRadius: '6px', padding: '0.5rem 2rem', textDecoration: 'none' }}>SVG DLA</NavLink>
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
