import React from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../store';
import { setBrushSize } from '../simple-2d-animated-dla-slice';
import type { RootState } from '../../../store';
import type { Simple2DAnimatedDLAUIState } from '../simple-2d-animated-dla-slice';
import './paint-brush-controls.css';

interface PaintBrushControlsProps {
  isRunning: boolean;
}

const PaintBrushControls: React.FC<PaintBrushControlsProps> = ({
  isRunning
}) => {
  const dispatch = useDispatch();
  const brushSize = useAppSelector((state: RootState) => 
    (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).brushSize
  );

  return (
    <div className="dlasim_paint-controls">
      <div className="dlasim_paint-row">
        <label htmlFor="dla-brush-size">Brush Size: </label>
        <input
          id="dla-brush-size"
          type="number"
          min={1}
          max={50}
          value={brushSize}
          onChange={handleBrushSizeChange}
          disabled={isRunning}
          className="dlasim_paint-input"
        />
      </div>
    </div>
  );

  function handleBrushSizeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0 && val <= 50) {
      dispatch(setBrushSize(val));
    }
  }
};

export default PaintBrushControls; 