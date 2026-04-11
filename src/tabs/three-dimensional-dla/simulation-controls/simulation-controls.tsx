import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../store";
import {
  setStickDistance,
  setCenterSticky,
  setFloorSticky,
} from "../three-dimensional-dla-slice";
import type { RootState } from "../../../store";
import "./simulation-controls.css";

interface SimulationControlsProps {
  isRunning: boolean;
  centerSticky: boolean;
  floorSticky: boolean;
}

function SimulationControls({
  isRunning,
  centerSticky,
  floorSticky,
}: SimulationControlsProps) {
  const dispatch = useDispatch();
  const stickDistance = useAppSelector(
    (state: RootState) => state.threeDimensionalDla.stickDistance,
  );

  return (
    <div className="dlasim-simulation-controls">
      <div className="dlasim-simulation-controls-row">
        <label htmlFor="dla-3d-stick-distance">Stick Distance:</label>
        <input
          id="dla-3d-stick-distance"
          type="number"
          inputMode="decimal"
          pattern="[0-9.]*"
          min={0.1}
          step={0.1}
          value={stickDistance}
          onChange={handleStickDistanceChange}
          disabled={isRunning}
          className="dlasim-simulation-controls-input"
        />
      </div>
      <div className="dlasim-simulation-controls-row">
        <label
          htmlFor="dla-3d-center-sticky"
          className="dlasim-simulation-controls-checkbox-label"
        >
          <input
            id="dla-3d-center-sticky"
            type="checkbox"
            checked={centerSticky}
            onChange={(e) => dispatch(setCenterSticky(e.target.checked))}
            disabled={isRunning}
            className="dlasim-simulation-controls-checkbox"
          />
          Center Sticky
        </label>
      </div>
      <div className="dlasim-simulation-controls-row">
        <label
          htmlFor="dla-3d-floor-sticky"
          className="dlasim-simulation-controls-checkbox-label"
        >
          <input
            id="dla-3d-floor-sticky"
            type="checkbox"
            checked={floorSticky}
            onChange={(e) => dispatch(setFloorSticky(e.target.checked))}
            disabled={isRunning}
            className="dlasim-simulation-controls-checkbox"
          />
          Floor Sticky
        </label>
      </div>
    </div>
  );

  function handleStickDistanceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) {
      dispatch(setStickDistance(val));
    }
  }
}

export default SimulationControls;
