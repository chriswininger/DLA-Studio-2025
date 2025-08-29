import React from 'react';
import ColorStopsControls from './color-stops-controls/color-stops-controls';
import GradientSlider from './gradient-slider/gradient-slider';
import './distance-gradient.css';

const DistanceGradient: React.FC = () => {
  return (
    <>
      <title>DLA Studio - Distance Gradient</title>
      <meta name="description" content="Visualize DLA clusters with a customizable color gradient based on particle distance from the center. Create beautiful and informative fractal art." />
      <div className="distance-gradient-container">
        <div className="distance-gradient-main-content">
          <div className="distance-gradient-visualization">
            <GradientSlider />
          </div>
          <div className="distance-gradient-controls">
            <ColorStopsControls />
          </div>
        </div>
      </div>
    </>
  );
};

export default DistanceGradient; 