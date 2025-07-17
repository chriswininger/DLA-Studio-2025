import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { updateColorStop, addColorStop, removeColorStop, setSelectedStop, type ColorStop } from '../distance-gradient-slice';
import './color-stops-controls.css';

const ColorStopsControls: React.FC = () => {
  const dispatch = useDispatch();
  const { colorStops, selectedStopId } = useSelector((state: RootState) => state.distanceGradient);

  const handleUpdateColorStop = (id: string, field: 'color' | 'position', value: string | number) => {
    dispatch(updateColorStop({ id, field, value }));
  };

  const handleRemoveColorStop = (id: string) => {
    dispatch(removeColorStop(id));
  };

  const handleAddColorStop = () => {
    dispatch(addColorStop());
  };

  const handleSelectStop = (id: string) => {
    dispatch(setSelectedStop(id));
  };

  return (
    <div className="color-stops-section">
      <h3 className="color-stops-title">STOPS</h3>
      <div className="color-stops-list">
        {colorStops.map((stop: ColorStop) => (
          <div 
            key={stop.id} 
            className={`color-stop-row ${selectedStopId === stop.id ? 'selected' : ''}`}
            onClick={() => handleSelectStop(stop.id)}
          >
            <div 
              className="color-swatch"
              style={{ backgroundColor: stop.color }}
            />
            <input
              type="text"
              className="color-input"
              value={stop.color}
              onChange={(e) => handleUpdateColorStop(stop.id, 'color', e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <input
              type="number"
              className="position-input"
              value={stop.position}
              onChange={(e) => handleUpdateColorStop(stop.id, 'position', parseInt(e.target.value) || 0)}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="remove-stop-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveColorStop(stop.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button className="add-stop-btn" onClick={handleAddColorStop}>
        + Add Stop
      </button>
    </div>
  );
};

export default ColorStopsControls; 