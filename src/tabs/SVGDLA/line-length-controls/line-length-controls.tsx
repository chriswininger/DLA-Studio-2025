import React from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../store';
import { setLineLength } from '../svg-dla-slice';
import type { RootState } from '../../../store';
import type { SVGDLAUIState } from '../svg-dla-slice';
import './line-length-controls.css';

const LineLengthControls: React.FC = () => {
  const dispatch = useDispatch();
  const lineLength = useAppSelector((state: RootState) => 
    (state.svgDla as SVGDLAUIState).lineLength
  );

  return (
    <div className="svgdla_line-length-controls">
      <div className="svgdla_line-length-row">
        <label htmlFor="svg-line-length">Line Length: </label>
        <input
          id="svg-line-length"
          type="number"
          min={0}
          value={lineLength}
          onChange={handleLineLengthChange}
          className="svgdla_line-length-input"
        />
      </div>
    </div>
  );

  function handleLineLengthChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 0) {
      dispatch(setLineLength(val));
    }
  }
};

export default LineLengthControls; 