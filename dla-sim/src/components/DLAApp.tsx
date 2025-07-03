import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createDLAState, stepDLA } from '../dla/dla';
import type { DLAState } from '../dla/dla';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const DEFAULT_PARTICLES = 10000;

const DLAApp: React.FC = () => {
  const [numParticles, setNumParticles] = useState<number>(DEFAULT_PARTICLES);
  const [running, setRunning] = useState<boolean>(false);
  const [dlaState, setDlaState] = useState<DLAState>(() =>
    createDLAState(CANVAS_WIDTH, CANVAS_HEIGHT, DEFAULT_PARTICLES)
  );
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize or reset simulation
  const resetSimulation = useCallback((particles: number) => {
    setDlaState(createDLAState(CANVAS_WIDTH, CANVAS_HEIGHT, particles));
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    setDlaState(prev => {
      if (prev.walkers.length === 0) {
        setRunning(false);
        return prev;
      }
      return stepDLA(prev);
    });
    animationRef.current = requestAnimationFrame(animate);
  }, []);

  // Start/stop animation
  useEffect(() => {
    if (running) {
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
  }, [running, animate]);

  // Draw DLA state
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    // Draw cluster
    ctx.fillStyle = '#00d8ff';
    dlaState.cluster.forEach(key => {
      const [x, y] = key.split(',').map(Number);
      ctx.fillRect(x, y, 1, 1);
    });
    // Draw walkers
    ctx.fillStyle = '#ff0080';
    dlaState.walkers.forEach(({ x, y }) => {
      ctx.fillRect(x, y, 1, 1);
    });
  }, [dlaState]);

  // Handle particle count input
  const handleParticlesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0 && val <= 10000) {
      setNumParticles(val);
    }
  };

  // Handle start/stop
  const handleStart = () => {
    if (dlaState.walkers.length === 0) {
      resetSimulation(numParticles);
    }
    setRunning(true);
  };
  const handleStop = () => setRunning(false);
  const handleReset = () => {
    setRunning(false);
    resetSimulation(numParticles);
  };

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
            max={10000}
            value={numParticles}
            onChange={handleParticlesChange}
            disabled={running}
            style={{ marginLeft: 8, width: 80 }}
          />
        </label>
      </div>
      <div>
        {!running ? (
          <button onClick={handleStart} style={{ marginRight: 8 }}>Start</button>
        ) : (
          <button onClick={handleStop} style={{ marginRight: 8 }}>Stop</button>
        )}
        <button onClick={handleReset} disabled={running}>Reset</button>
      </div>
      <div style={{ marginTop: 12, color: '#888' }}>
        Steps: {dlaState.steps} | Remaining walkers: {dlaState.walkers.length}
      </div>
    </div>
  );
};

export default DLAApp;
