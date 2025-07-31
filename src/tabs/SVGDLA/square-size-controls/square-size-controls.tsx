import React from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../store';
import { setSquareSize, setRotations, setStroke } from '../svg-dla-slice';
import type { RootState } from '../../../store';
import type { SVGDLAUIState } from '../svg-dla-slice';
import './square-size-controls.css';

const SquareSizeControls: React.FC = () => {
  const dispatch = useDispatch();
  const squareSize = useAppSelector((state: RootState) => 
    (state.svgDla as SVGDLAUIState).squareSize
  );
  const rotations = useAppSelector((state: RootState) => 
    (state.svgDla as SVGDLAUIState).rotations
  );
  const stroke = useAppSelector((state: RootState) => 
    (state.svgDla as SVGDLAUIState).stroke
  );

  return (
    <div className="svgdla_square-size-controls">
      <div className="svgdla_square-size-row">
        <label htmlFor="svg-square-size">Square Size: </label>
        <input
          id="svg-square-size"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min={0}
          value={squareSize}
          onChange={handleSquareSizeChange}
          className="svgdla_square-size-input"
        />
      </div>
      <div className="svgdla_square-size-row">
        <label htmlFor="svg-rotations">Rotations: </label>
        <input
          id="svg-rotations"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min={0}
          max={360}
          value={rotations}
          onChange={handleRotationsChange}
          className="svgdla_square-size-input"
        />
      </div>
      <div className="svgdla_square-size-row">
        <label htmlFor="svg-stroke">
          <input
            id="svg-stroke"
            type="checkbox"
            checked={stroke}
            onChange={handleStrokeChange}
            className="svgdla_square-size-checkbox"
          />
          Stroke
        </label>
      </div>
    </div>
  );

  function handleSquareSizeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 0) {
      dispatch(setSquareSize(val));
    }
  }

  function handleRotationsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 0 && val <= 360) {
      dispatch(setRotations(val));
    }
  }

  function handleStrokeChange(e: React.ChangeEvent<HTMLInputElement>) {
    dispatch(setStroke(e.target.checked));
  }
};

export default SquareSizeControls; 