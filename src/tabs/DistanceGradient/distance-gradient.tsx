import React from 'react';
import ColorStopsControls from './color-stops-controls/color-stops-controls';
import './distance-gradient.css';

const DistanceGradient: React.FC = () => {
  return (
    <div className="distance-gradient-container">
      <h2>Distance Gradient</h2>
      <div className="distance-gradient-main-content">
        <div className="distance-gradient-visualization">
          {/* Visualization area will go here */}
          <div className="distance-gradient-placeholder">
            Distance Gradient visualization coming soon...
          </div>
        </div>
        <div className="distance-gradient-controls">
          <ColorStopsControls />
        </div>
      </div>
    </div>
  );
};

export default DistanceGradient; 