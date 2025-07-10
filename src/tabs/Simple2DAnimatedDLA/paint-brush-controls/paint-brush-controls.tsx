import React from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../store';
import { setBrushSize, setBrushParticles } from '../simple-2d-animated-dla-slice';
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
  const brushParticles = useAppSelector((state: RootState) => 
    (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).brushParticles
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
      <div className="dlasim_paint-row">
        <label htmlFor="dla-brush-particles">Particles to Spawn: </label>
        <input
          id="dla-brush-particles"
          type="number"
          min={1}
          max={1000}
          value={brushParticles}
          onChange={handleBrushParticlesChange}
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

  function handleBrushParticlesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0 && val <= 1000) {
      dispatch(setBrushParticles(val));
    }
  }
};

export default PaintBrushControls; 