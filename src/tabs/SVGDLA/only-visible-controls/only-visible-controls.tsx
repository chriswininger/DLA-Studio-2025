import React from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../store';
import { setOnlyVisible } from '../svg-dla-slice';
import type { RootState } from '../../../store';
import type { SVGDLAUIState } from '../svg-dla-slice';
import './only-visible-controls.css';

const OnlyVisibleControls: React.FC = () => {
  const dispatch = useDispatch();
  const onlyVisible = useAppSelector((state: RootState) => 
    (state.svgDla as SVGDLAUIState).onlyVisible
  );

  return (
    <div className="svgdla_only-visible-controls">
      <div className="svgdla-checkbox-label">
        <input
          type="checkbox"
          checked={onlyVisible}
          onChange={e => dispatch(setOnlyVisible(e.target.checked))}
          className="svgdla-checkbox"
        />
        Only Visible
      </div>
    </div>
  );
};

export default OnlyVisibleControls; 