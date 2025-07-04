import React, { useRef, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../store';
import { setNumParticles, setIsRunning } from './simple-2d-animated-dla-slice';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './simple-2d-animated-dla-constants';
import { createDLAState, stepDLA } from '../../dla/dla';
import type { DLAState } from '../../dla/dla';
import type { RootState } from '../../store';
import type { Simple2DAnimatedDLAUIState } from './simple-2d-animated-dla-slice';
// Vite/ESM native worker import
// No import needed, use new Worker(new URL(...), { type: 'module' })

const Simple2DAnimatedDLA: React.FC = () => {
  const dispatch = useDispatch();
  const numParticles = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).numParticles);
  const isRunning = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).isRunning);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const dlaStateRef = useRef<DLAState | null>(null);
  const stepsRef = useRef<number>(0);
  const [spawnSquareSize, setSpawnSquareSize] = React.useState(100);
  const [progressTick, setProgressTick] = React.useState(0);
  const [isSimulating, setIsSimulating] = React.useState(false);
  const workerRef = React.useRef<Worker | null>(null);

  // Initialize simulation when numParticles changes
  useEffect(() => {
    dlaStateRef.current = createDLAState(CANVAS_WIDTH, CANVAS_HEIGHT, numParticles, spawnSquareSize);
    stepsRef.current = 0;
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numParticles, spawnSquareSize]);

  // Draw function
  const draw = useCallback(() => {
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
  }, []);

  // Animation loop
  useEffect(() => {
    if (isRunning) {
      const animate = () => {
        if (dlaStateRef.current) {
          dlaStateRef.current = stepDLA(dlaStateRef.current);
          stepsRef.current += 1;
          draw();
          if (dlaStateRef.current.walkers.length > 0) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            dispatch(setIsRunning(false));
          }
        }
      };
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, dispatch, draw]);

  // Handle particle count input
  const handleParticlesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      dispatch(setNumParticles(val));
    }
  };

  // Handle spawn square size input
  const handleSpawnSquareSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      setSpawnSquareSize(val);
    }
  };

  // Handle start/stop/reset
  const handleStart = () => {
    if (!dlaStateRef.current || dlaStateRef.current.walkers.length === 0) {
      dlaStateRef.current = createDLAState(CANVAS_WIDTH, CANVAS_HEIGHT, numParticles, spawnSquareSize);
      stepsRef.current = 0;
      draw();
    }
    dispatch(setIsRunning(true));
  };
  const handleStop = () => dispatch(setIsRunning(false));
  const handleReset = () => {
    dispatch(setIsRunning(false));
    dlaStateRef.current = createDLAState(CANVAS_WIDTH, CANVAS_HEIGHT, numParticles, spawnSquareSize);
    stepsRef.current = 0;
    draw();
  };

  // Simulate to completion (no animation frames)
  const handleSimulateToCompletion = () => {
    setIsSimulating(true);
    setProgressTick(t => t + 1);
    workerRef.current = new Worker(new URL('./dla-worker.ts', import.meta.url), { type: 'module' });
    workerRef.current.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.type === 'progress') {
        stepsRef.current = msg.steps;
        if (dlaStateRef.current) {
          // Only update walkers count for progress
          dlaStateRef.current.walkers = new Array(msg.walkers).fill({x:0,y:0});
        }
        setProgressTick(t => t + 1);
      } else if (msg.type === 'done') {
        stepsRef.current = msg.steps;
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
  };

  // Get current simulation info for display
  const walkersCount = dlaStateRef.current?.walkers.length ?? 0;
  const steps = stepsRef.current;

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>DLA Simulation</h1>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ border: '1px solid #ccc', background: '#111' }}
      />
      <div style={{ margin: '1em 0' }}>
        <label>
          Particles:
          <input
            type="number"
            min={1}
            value={numParticles}
            onChange={handleParticlesChange}
            disabled={isRunning}
            style={{ marginLeft: 8, width: 120 }}
          />
        </label>
        <label style={{ marginLeft: 16 }}>
          Spawn Square Size:
          <input
            type="number"
            min={1}
            value={spawnSquareSize}
            onChange={handleSpawnSquareSizeChange}
            disabled={isRunning}
            style={{ marginLeft: 8, width: 120 }}
          />
        </label>
      </div>
      <div>
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
      <div style={{ marginTop: 12, color: '#888' }}>
        Steps: {steps} | Remaining walkers: {walkersCount}
      </div>
    </div>
  );
};

export default Simple2DAnimatedDLA;
