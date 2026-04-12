import { useDispatch } from "react-redux";
import { useAppSelector } from "../../../store";
import {
  setNumParticles,
  setSpawnMode,
  setSpawnSphereRadius,
  addWalkers,
} from "../three-dimensional-dla-slice";
import type { SpawnMode } from "../three-dimensional-dla-slice";
import type { RootState } from "../../../store";
import type { Point3D } from "../dla-3d";
import { BOUND_HALF_EXTENT } from "../three-dimensional-dla-constants";
import "./sphere-spawn-controls.css";

interface SphereSpawnControlsProps {
  isRunning: boolean;
}

function SphereSpawnControls({ isRunning }: SphereSpawnControlsProps) {
  const dispatch = useDispatch();
  const numParticles = useAppSelector(
    (state: RootState) => state.threeDimensionalDla.numParticles,
  );
  const spawnMode = useAppSelector(
    (state: RootState) => state.threeDimensionalDla.spawnMode,
  );
  const spawnSphereRadius = useAppSelector(
    (state: RootState) => state.threeDimensionalDla.spawnSphereRadius,
  );

  return (
    <div className="dlasim-sphere-spawn-controls">
      <div className="dlasim-sphere-spawn-mode-group">
        <label className="dlasim-sphere-spawn-mode-label">
          <input
            type="radio"
            name="dla-3d-spawn-mode"
            value="sphere"
            checked={spawnMode === "sphere"}
            onChange={handleModeChange}
            disabled={isRunning}
          />
          About Sphere
        </label>
        <label className="dlasim-sphere-spawn-mode-label">
          <input
            type="radio"
            name="dla-3d-spawn-mode"
            value="random"
            checked={spawnMode === "random"}
            onChange={handleModeChange}
            disabled={isRunning}
          />
          Random
        </label>
      </div>
      <div className="dlasim-sphere-spawn-row">
        <label htmlFor="dla-3d-spawn-count">Particles to Spawn:</label>
        <input
          id="dla-3d-spawn-count"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min={1}
          value={numParticles}
          onChange={handleParticlesChange}
          disabled={isRunning}
          className="dlasim-sphere-spawn-input"
        />
      </div>
      {spawnMode === "sphere" && (
        <div className="dlasim-sphere-spawn-row">
          <label htmlFor="dla-3d-spawn-radius">Spawn Sphere Radius:</label>
          <input
            id="dla-3d-spawn-radius"
            type="number"
            inputMode="numeric"
            pattern="[0-9.]*"
            min={0.1}
            step={0.5}
            value={spawnSphereRadius}
            onChange={handleRadiusChange}
            disabled={isRunning}
            className="dlasim-sphere-spawn-input"
          />
        </div>
      )}
      <button
        onClick={handleSpawn}
        disabled={isRunning}
        className="dlasim-sphere-spawn-button"
      >
        Spawn
      </button>
    </div>
  );

  function handleModeChange(e: React.ChangeEvent<HTMLInputElement>) {
    dispatch(setSpawnMode(e.target.value as SpawnMode));
  }

  function handleParticlesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      dispatch(setNumParticles(val));
    }
  }

  function handleRadiusChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) {
      dispatch(setSpawnSphereRadius(val));
    }
  }

  function handleSpawn() {
    const walkers =
      spawnMode === "sphere"
        ? spawnWalkersInSphere(numParticles, spawnSphereRadius)
        : spawnWalkersInBounds(numParticles, BOUND_HALF_EXTENT);
    dispatch(addWalkers(walkers));
  }
}

function spawnWalkersInSphere(count: number, radius: number): Point3D[] {
  const walkers: Point3D[] = [];
  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = radius * Math.cbrt(Math.random());
    walkers.push({
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi),
    });
  }
  return walkers;
}

function spawnWalkersInBounds(count: number, halfExtent: number): Point3D[] {
  const walkers: Point3D[] = [];
  for (let i = 0; i < count; i++) {
    walkers.push({
      x: (Math.random() * 2 - 1) * halfExtent,
      y: (Math.random() * 2 - 1) * halfExtent,
      z: (Math.random() * 2 - 1) * halfExtent,
    });
  }
  return walkers;
}

export default SphereSpawnControls;
