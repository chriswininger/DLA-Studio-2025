import React from 'react';
import ColorStopsControls from './color-stops-controls/color-stops-controls';
import GradientSlider from './gradient-slider/gradient-slider';
import './distance-gradient.css';

const DistanceGradient: React.FC = () => {
  return (
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
  );
};

export default DistanceGradient; 