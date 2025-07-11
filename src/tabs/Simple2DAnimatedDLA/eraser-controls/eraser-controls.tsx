import React from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../store';
import { setEraserSize } from '../simple-2d-animated-dla-slice';
import type { RootState } from '../../../store';
import type { Simple2DAnimatedDLAUIState } from '../simple-2d-animated-dla-slice';
import './eraser-controls.css';

interface EraserControlsProps {
  isRunning: boolean;
}

const EraserControls: React.FC<EraserControlsProps> = ({
  isRunning
}) => {
  const dispatch = useDispatch();
  const eraserSize = useAppSelector((state: RootState) => 
    (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).eraserSize
  );

  return (
    <div className="dlasim_eraser-controls">
      <div className="dlasim_eraser-row">
        <label htmlFor="dla-eraser-size">Eraser Size: </label>
        <input
          id="dla-eraser-size"
          type="number"
          min={1}
          value={eraserSize}
          onChange={handleEraserSizeChange}
          disabled={isRunning}
          className="dlasim_eraser-input"
        />
      </div>
    </div>
  );

  function handleEraserSizeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      dispatch(setEraserSize(val));
    }
  }
};

export default EraserControls; 