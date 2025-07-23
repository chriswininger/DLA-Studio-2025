import React from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../store';
import { setSquareSize } from '../svg-dla-slice';
import type { RootState } from '../../../store';
import type { SVGDLAUIState } from '../svg-dla-slice';
import './square-size-controls.css';

const SquareSizeControls: React.FC = () => {
  const dispatch = useDispatch();
  const squareSize = useAppSelector((state: RootState) => 
    (state.svgDla as SVGDLAUIState).squareSize
  );

  return (
    <div className="svgdla_square-size-controls">
      <div className="svgdla_square-size-row">
        <label htmlFor="svg-square-size">Square Size: </label>
        <input
          id="svg-square-size"
          type="number"
          min={0}
          value={squareSize}
          onChange={handleSquareSizeChange}
          className="svgdla_square-size-input"
        />
      </div>
    </div>
  );

  function handleSquareSizeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 0) {
      dispatch(setSquareSize(val));
    }
  }
};

export default SquareSizeControls; 