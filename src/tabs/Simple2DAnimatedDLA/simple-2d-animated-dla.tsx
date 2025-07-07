import React, { useRef, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../store';
import { setNumParticles, setIsRunning } from './simple-2d-animated-dla-slice';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './simple-2d-animated-dla-constants';
import { createDLAState, spawnWalkersInSquare, stepDLA } from '../../dla/dla';
import type { DLAState } from '../../dla/dla';
import type { RootState } from '../../store';
import type { Simple2DAnimatedDLAUIState } from './simple-2d-animated-dla-slice';
import './simple-2d-animated-dla.css';
import ToolBar from './tool-bar';
// Vite/ESM native worker import
// No import needed, use new Worker(new URL(...), { type: 'module' })

const Simple2DAnimatedDLA: React.FC = () => {
  const dispatch = useDispatch();
  const numParticles = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).numParticles);
  const isRunning = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).isRunning);
  const selectedTool = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).selectedTool);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dlaStateRef = useRef<DLAState | null>(null);
  const [steps, setSteps] = React.useState(0);
  const [spawnSquareSize, setSpawnSquareSize] = React.useState(100);
  const [progressTick, setProgressTick] = React.useState(0);
  const [isSimulating, setIsSimulating] = React.useState(false);
  const workerRef = React.useRef<Worker | null>(null);

  useEffect(initializeState, []);
  const draw = useCallback(doDraw, []);
  const stepAnimation = useCallback(doStepAnimation, [draw, dispatch]);

  useAnimationLoop(stepAnimation, isRunning);

  // Get current simulation info for display
  const walkersCount = dlaStateRef.current?.walkers.length ?? 0;


  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start' }}>
        {/* Tool selection UI */}
        <ToolBar />
        {/* Canvas and button row column */}
        <div className="dlasim_canvas-col">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{ border: '1px solid #ccc', background: '#111' }}
          />
          <div className="dlasim_button-row">
            {!isRunning ? (
              <button onClick={handleStart} style={{ marginRight: 8 }}>Start</button>
            ) : (
              <button onClick={handleStop} style={{ marginRight: 8 }}>Stop</button>
            )}
            <button onClick={handleReset} disabled={isRunning}>Reset</button>
            <button onClick={handleSimulateToCompletion} disabled={isRunning || isSimulating} style={{ marginLeft: 8 }}>
              {isSimulating ? 'Simulating...' : 'Simulate to Completion'}
            </button>
          </div>
          <div className="dlasim_status-row">
            Steps: {steps} | Remaining walkers: {walkersCount} | Progress: {progressTick}
          </div>
        </div>
        {/* Spawn controls */}
        <div style={{ marginLeft: 48, border: '2px solid #5a6cff', borderRadius: 8, padding: 24, minWidth: 300 }}>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="dla-spawn-count">Particles to Spawn: </label>
            <input
              id="dla-spawn-count"
              type="number"
              min={1}
              value={numParticles}
              onChange={handleParticlesChange}
              disabled={isRunning}
              style={{ marginLeft: 8, width: 120 }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="dla-spawn-size">Spawn Square Size: </label>
            <input
              id="dla-spawn-size"
              type="number"
              min={1}
              value={spawnSquareSize}
              onChange={handleSpawnSquareSizeChange}
              disabled={isRunning}
              style={{ marginLeft: 8, width: 120 }}
            />
          </div>
          <button onClick={handleSpawn} disabled={isRunning} style={{ marginTop: 8, width: 100 }}>
            Spawn
          </button>
        </div>
      </div>
    </div>
  );

  // Handle particle count input
  function handleParticlesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      dispatch(setNumParticles(val));
    }
  }

  // Handle spawn square size input
  function handleSpawnSquareSizeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      setSpawnSquareSize(val);
    }
  }

  // Handle start/stop/reset
  function handleStart() {

    dispatch(setIsRunning(true));
  }

  function handleStop() {
    dispatch(setIsRunning(false));
  }

  function handleReset() {
    dispatch(setIsRunning(false));
    dlaStateRef.current = createDLAState(CANVAS_WIDTH, CANVAS_HEIGHT);
    setSteps(0);
    draw();
  }

  // Simulate to completion (no animation frames)
  function handleSimulateToCompletion() {
    setIsSimulating(true);
    setProgressTick(t => t + 1);
    workerRef.current = new Worker(new URL('./dla-worker.ts', import.meta.url), { type: 'module' });
    workerRef.current.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.type === 'progress') {
        setSteps(msg.steps);
        if (dlaStateRef.current) {
          // Only update walkers count for progress
          dlaStateRef.current.walkers = new Array(msg.walkers).fill({x:0,y:0});
        }
        setProgressTick(t => t + 1);
      } else if (msg.type === 'done') {
        setSteps(msg.steps);
        if (dlaStateRef.current) {
          dlaStateRef.current.cluster = new Set(msg.cluster);
          dlaStateRef.current.walkers = [];
        }
        setProgressTick(t => t + 1);
        draw();
        setIsSimulating(false);
        workerRef.current?.terminate();
        workerRef.current = null;
        dispatch(setIsRunning(false));
      }
    };
    workerRef.current.postMessage({
      type: 'simulate',
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      numWalkers: numParticles,
      spawnSquareSize,
      progressInterval: 1000,
    });
  }



  function handleSpawn() {
    if (dlaStateRef.current) {
      const newWalkers = spawnWalkersInSquare(CANVAS_WIDTH, CANVAS_HEIGHT, numParticles, spawnSquareSize);
      dlaStateRef.current.walkers = [...dlaStateRef.current.walkers, ...newWalkers];
      draw();
    }
  }

  function doStepAnimation(): boolean {
    if (dlaStateRef.current) {
      dlaStateRef.current = stepDLA(dlaStateRef.current);
      setSteps(prev => prev + 1);
      draw();
      if (dlaStateRef.current.walkers.length === 0) {
        dispatch(setIsRunning(false));
        return false; // Stop animation
      }
      return true; // Continue animation
    }
    return false;
  }

  function doDraw() {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !dlaStateRef.current) return;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Draw cluster
    ctx.fillStyle = '#00d8ff';
    dlaStateRef.current.cluster.forEach((key: string) => {
      const [x, y]: [number, number] = key.split(',').map(Number) as [number, number];
      ctx.fillRect(x, y, 1, 1);
    });
    // Draw walkers
    ctx.fillStyle = '#ff0080';
    dlaStateRef.current.walkers.forEach(({ x, y }: { x: number; y: number }) => {
      ctx.fillRect(x, y, 1, 1);
    });
  }

  function initializeState() {
    // Only initialize cluster and walkers on first mount or reset
    if (!dlaStateRef.current) {
      dlaStateRef.current = createDLAState(CANVAS_WIDTH, CANVAS_HEIGHT);
      setSteps(0);
      draw();
    }
  }
};

// Custom hook for animation loop
function useAnimationLoop(callback: () => boolean, isRunning: boolean) {
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      return;
    }

    const animate = () => {
      const shouldContinue = callback();
      if (shouldContinue) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        requestRef.current = null;
      }
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [isRunning, callback]);

  return requestRef.current;
}

export default Simple2DAnimatedDLA;
