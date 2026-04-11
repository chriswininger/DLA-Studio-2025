import './App.css'
import './tabs/tabs.css'
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {PageTracker} from "./analytics/page-tracker.ts";
import {Tabs} from "./navigation/tabs/tabs.tsx";
import Simple2DAnimatedDLA from "./tabs/Simple2DAnimatedDLA/simple-2d-animated-dla.tsx";
import DistanceGradient from "./tabs/DistanceGradient/distance-gradient.tsx";
import {SVGDLA} from "./tabs/SVGDLA/svg-dla.tsx";
import ThreeDimensionalDLA from "./tabs/three-dimensional-dla/three-dimensional-dla.tsx";
import About from "./tabs/About/about.tsx";

function App() {
  return (
    <Router basename="/">
      <PageTracker />
      <Tabs />
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
    </Router>
  )
}

export default App
