import React from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../store';
import { setNumParticles, setSpawnXOffset, setSpawnYOffset, setSpawnRotation, setSpawnSquareSize } from '../simple-2d-animated-dla-slice';
import { spawnWalkersInSquare } from '../../../dla/dla';
import type { RootState } from '../../../store';
import type { Simple2DAnimatedDLAUIState } from '../simple-2d-animated-dla-slice';
import './shape-spawn-controls.css';

interface ShapeSpawnControlsProps {
  canvasWidth: number;
  canvasHeight: number;
  onSpawn: (walkers: { x: number; y: number }[]) => void;
  isRunning: boolean;
  spawnSquareSize: number;
}

const ShapeSpawnControls: React.FC<ShapeSpawnControlsProps> = ({
  canvasWidth,
  canvasHeight,
  onSpawn,
  isRunning,
  spawnSquareSize,
}) => {
  const dispatch = useDispatch();
  const numParticles = useAppSelector((state: RootState) => 
    (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).numParticles
  );
  const spawnXOffset = useAppSelector((state: RootState) => 
    (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).spawnXOffset
  );
  const spawnYOffset = useAppSelector((state: RootState) => 
    (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).spawnYOffset
  );
  const spawnRotation = useAppSelector((state: RootState) => 
    (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).spawnRotation
  );

  return (
    <div className="dlasim_spawn-controls">
      <div className="dlasim_spawn-row">
        <label htmlFor="dla-spawn-count">Particles to Spawn: </label>
        <input
          id="dla-spawn-count"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min={1}
          value={numParticles}
          onChange={handleParticlesChange}
          disabled={isRunning}
          className="dlasim_spawn-input"
        />
      </div>
      <div className="dlasim_spawn-row">
        <label htmlFor="dla-spawn-size">Spawn Square Size: </label>
        <input
          id="dla-spawn-size"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min={1}
          value={spawnSquareSize}
          onChange={handleSpawnSquareSizeChange}
          disabled={isRunning}
          className="dlasim_spawn-input"
        />
      </div>
      <div className="dlasim_spawn-row">
        <label htmlFor="dla-spawn-x-offset">X Offset: </label>
        <input
          id="dla-spawn-x-offset"
          type="number"
          inputMode="numeric"
          pattern="[0-9-]*"
          value={spawnXOffset}
          onChange={handleXOffsetChange}
          disabled={isRunning}
          className="dlasim_spawn-input"
        />
      </div>
      <div className="dlasim_spawn-row">
        <label htmlFor="dla-spawn-y-offset">Y Offset: </label>
        <input
          id="dla-spawn-y-offset"
          type="number"
          inputMode="numeric"
          pattern="[0-9-]*"
          value={spawnYOffset}
          onChange={handleYOffsetChange}
          disabled={isRunning}
          className="dlasim_spawn-input"
        />
      </div>
      <div className="dlasim_spawn-row">
        <label htmlFor="dla-spawn-rotation">Rotation (degrees): </label>
        <input
          id="dla-spawn-rotation"
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          min={0}
          max={360}
          step={1}
          value={spawnRotation}
          onChange={handleRotationChange}
          disabled={isRunning}
          className="dlasim_spawn-input"
        />
      </div>
      <button 
        onClick={handleSpawn} 
        disabled={isRunning} 
        className="dlasim_spawn-button"
      >
        Spawn
      </button>
    </div>
  );

  function handleParticlesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      dispatch(setNumParticles(val));
    }
  }

  function handleSpawnSquareSizeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      dispatch(setSpawnSquareSize(val));
    }
  }

  function handleXOffsetChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      dispatch(setSpawnXOffset(val));
    }
  }

  function handleYOffsetChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      dispatch(setSpawnYOffset(val));
    }
  }

  function handleRotationChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      dispatch(setSpawnRotation(val));
    }
  }

  // Handle spawn button click
  function handleSpawn() {
    const newWalkers = spawnWalkersInSquare(canvasWidth, canvasHeight, numParticles, spawnSquareSize, spawnXOffset, spawnYOffset, spawnRotation);
    onSpawn(newWalkers);
  }
};

export default ShapeSpawnControls; 