import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { updateColorStop, addColorStop, removeColorStop, type ColorStop } from '../distance-gradient-slice';
import './color-stops-controls.css';
import ColorChooser from './color-chooser';

const ColorStopsControls: React.FC = () => {
  const dispatch = useDispatch();
  const { colorStops } = useSelector((state: RootState) => state.distanceGradient);

  const [activeColorId, setActiveColorId] = React.useState<string | null>(null);

  const handleUpdateColorStop = (id: string, field: 'color' | 'position', value: string | number) => {
    dispatch(updateColorStop({ id, field, value }));
  };

  const handleRemoveColorStop = (id: string) => {
    dispatch(removeColorStop(id));
  };

  const handleAddColorStop = () => {
    dispatch(addColorStop());
  };

  const handleSwatchClick = (id: string) => {
    setActiveColorId(id === activeColorId ? null : id);
  };

  const handleColorChooserChange = (color: string) => {
    if (activeColorId) {
      handleUpdateColorStop(activeColorId, 'color', color);
    }
  };

  const activeColor = colorStops.find(stop => stop.id === activeColorId)?.color || '';

  return (
    <div className="color-stops-section">
      <h3 className="color-stops-title">STOPS</h3>
      <div className="color-stops-list">
        {colorStops.map((stop: ColorStop) => (
          <div 
            key={stop.id} 
            className='color-stop-row'
          >
            <div 
              className="color-swatch"
              style={{ backgroundColor: stop.color, border: stop.id === activeColorId ? '2px solid var(--dlasim-primary-color)' : undefined }}
              onClick={() => handleSwatchClick(stop.id)}
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
      {activeColorId && (
        <ColorChooser color={activeColor} onChange={handleColorChooserChange} />
      )}
    </div>
  );
};

export default ColorStopsControls; 