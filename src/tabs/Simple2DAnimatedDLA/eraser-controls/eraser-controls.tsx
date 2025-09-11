import React from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../store';
import { setEraserSize, setEraseParticleType } from '../simple-2d-animated-dla-slice';
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
  const eraseParticleType = useAppSelector((state: RootState) => 
    (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).eraseParticleType
  );

  return (
    <div className="dlasim_eraser-controls">
      <div className="dlasim_eraser-row">
        <label htmlFor="dla-eraser-size">Eraser Size: </label>
        <input
          id="dla-eraser-size"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min={1}
          value={eraserSize}
          onChange={handleEraserSizeChange}
          disabled={isRunning}
          className="dlasim_eraser-input"
        />
      </div>
      <div className="dlasim_eraser-row">
        <div className="dlasim_radio-group">
          <label className="dlasim_radio-label">
            <input
              type="radio"
              name="erase-particle-type"
              value="walkers"
              checked={eraseParticleType === 'walkers'}
              onChange={handleEraseParticleTypeChange}
              disabled={isRunning}
              className="dlasim_radio-input"
            />
            Walkers
          </label>
          <label className="dlasim_radio-label">
            <input
              type="radio"
              name="erase-particle-type"
              value="stuck points"
              checked={eraseParticleType === 'stuck points'}
              onChange={handleEraseParticleTypeChange}
              disabled={isRunning}
              className="dlasim_radio-input"
            />
            Stuck Points
          </label>
        </div>
      </div>
    </div>
  );

  function handleEraserSizeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      dispatch(setEraserSize(val));
    }
  }

  function handleEraseParticleTypeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value as 'walkers' | 'stuck points';
    dispatch(setEraseParticleType(value));
  }
};

export default EraserControls; 