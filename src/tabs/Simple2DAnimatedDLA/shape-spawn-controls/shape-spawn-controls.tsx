import React from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../store';
import { setNumParticles } from '../simple-2d-animated-dla-slice';
import { spawnWalkersInSquare } from '../../../dla/dla';
import type { RootState } from '../../../store';
import type { Simple2DAnimatedDLAUIState } from '../simple-2d-animated-dla-slice';
import './shape-spawn-controls.css';

interface ShapeSpawnControlsProps {
  canvasWidth: number;
  canvasHeight: number;
  onSpawn: (walkers: { x: number; y: number }[]) => void;
  isRunning: boolean;
}

const ShapeSpawnControls: React.FC<ShapeSpawnControlsProps> = ({
  canvasWidth,
  canvasHeight,
  onSpawn,
  isRunning
}) => {
  const dispatch = useDispatch();
  const numParticles = useAppSelector((state: RootState) => 
    (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).numParticles
  );
  const [spawnSquareSize, setSpawnSquareSize] = React.useState(100);


  return (
    <div className="dlasim_spawn-controls">
      <div className="dlasim_spawn-row">
        <label htmlFor="dla-spawn-count">Particles to Spawn: </label>
        <input
          id="dla-spawn-count"
          type="number"
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
          min={1}
          value={spawnSquareSize}
          onChange={handleSpawnSquareSizeChange}
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
      setSpawnSquareSize(val);
    }
  }

  // Handle spawn button click
  function handleSpawn() {
    const newWalkers = spawnWalkersInSquare(canvasWidth, canvasHeight, numParticles, spawnSquareSize);
    onSpawn(newWalkers);
  }
};

export default ShapeSpawnControls; 