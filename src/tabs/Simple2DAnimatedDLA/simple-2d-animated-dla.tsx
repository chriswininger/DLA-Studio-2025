import React, { useRef, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../store';
import { setIsRunning } from './simple-2d-animated-dla-slice';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './simple-2d-animated-dla-constants';
import { createDLAState, stepDLA } from '../../dla/dla';
import type { DLAState } from '../../dla/dla';
import type { RootState } from '../../store';
import type { Simple2DAnimatedDLAUIState } from './simple-2d-animated-dla-slice';
import './simple-2d-animated-dla.css';
import ToolBar from './tool-bar/tool-bar';
import ShapeSpawnControls from './shape-spawn-controls/shape-spawn-controls';
import PaintBrushControls from './paint-brush-controls/paint-brush-controls';
import EraserControls from './eraser-controls/eraser-controls';
// Vite/ESM native worker import
// No import needed, use new Worker(new URL(...), { type: 'module' })

const Simple2DAnimatedDLA: React.FC = () => {
  const dispatch = useDispatch();
  const isRunning = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).isRunning);
  const spawnXOffset = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).spawnXOffset);
  const spawnYOffset = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).spawnYOffset);
  const spawnRotation = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).spawnRotation);
  const spawnSquareSize = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).spawnSquareSize);
  const selectedTool = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).selectedTool);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dlaStateRef = useRef<DLAState | null>(null);
  const [steps, setSteps] = React.useState(0);
  const [isSimulating, setIsSimulating] = React.useState(false);
  const workerRef = React.useRef<Worker | null>(null);
  const shouldShowSpawnShapePreview = selectedTool === 'spawn-shapes' && !isRunning;

  useEffect(initializeState, []);
  const draw = useCallback(doDraw, [spawnXOffset, spawnYOffset, spawnRotation, spawnSquareSize, isRunning, shouldShowSpawnShapePreview]);
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
            Steps: {steps} | Remaining walkers: {walkersCount}
          </div>
        </div>
        {/* Spawn controls - only show when spawn-shapes tool is selected */}
        {selectedTool === 'spawn-shapes' && (
          <ShapeSpawnControls
            canvasWidth={CANVAS_WIDTH}
            canvasHeight={CANVAS_HEIGHT}
            onSpawn={handleSpawn}
            isRunning={isRunning}
            spawnSquareSize={spawnSquareSize}
            onSpawnShapeChanged={handleSpawnShapeChanged}
          />
        )}
        {/* Paint brush controls - only show when brush tool is selected */}
        {selectedTool === 'brush' && (
          <PaintBrushControls
            isRunning={isRunning}
          />
        )}
        {/* Eraser controls - only show when eraser tool is selected */}
        {selectedTool === 'eraser' && (
          <EraserControls
            isRunning={isRunning}
          />
        )}
      </div>
    </div>
  );

  // Handle start/stop/reset
  function handleStart() {
    console.info("started")
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
    setSteps(0);
    workerRef.current = new Worker(new URL('./dla-worker.ts', import.meta.url), { type: 'module' });
    workerRef.current.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.type === 'progress') {
        setSteps(msg.steps);
        // Update the current state with the latest walkers and their positions
        if (dlaStateRef.current && msg.walkerPositions) {
          dlaStateRef.current.walkers = msg.walkerPositions;
        }
      } else if (msg.type === 'done') {
        setSteps(msg.steps);
        if (dlaStateRef.current) {
          dlaStateRef.current.cluster = new Set(msg.cluster);
          dlaStateRef.current.walkers = [];
          dlaStateRef.current.steps = msg.steps;
        }
        draw();
        setIsSimulating(false);
        workerRef.current?.terminate();
        workerRef.current = null;
        dispatch(setIsRunning(false));
      } else if (msg.type === 'error') {
        console.error('Worker error:', msg.error);
        setIsSimulating(false);
        workerRef.current?.terminate();
        workerRef.current = null;
      }
    };
    // Prepare the current DLA state for the worker
    const currentState = dlaStateRef.current;
    if (!currentState) {
      console.error('No DLA state available for simulation');
      setIsSimulating(false);
      return;
    }

    workerRef.current.postMessage({
      type: 'simulate',
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      dlaState: {
        cluster: Array.from(currentState.cluster),
        walkers: currentState.walkers,
        steps: currentState.steps
      },
      progressInterval: 1000,
    });
  }



  function handleSpawn(newWalkers: { x: number; y: number }[]) {
    if (dlaStateRef.current) {
      console.log('Current cluster size:', dlaStateRef.current.cluster.size);
      console.log('Cluster positions:', Array.from(dlaStateRef.current.cluster));
      console.log('Spawning walkers:', newWalkers.length);
      
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

  function handleSpawnShapeChanged() {
    draw();
  }

  function doDraw() {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !dlaStateRef.current) return;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    if (shouldShowSpawnShapePreview) {
      drawShapeSpawn(ctx);
    }
    
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

  function drawShapeSpawn(ctx: CanvasRenderingContext2D) {
    const centerX = Math.floor(CANVAS_WIDTH / 2) + spawnXOffset;
    const centerY = Math.floor(CANVAS_HEIGHT / 2) + spawnYOffset;
    const halfSize = Math.floor(spawnSquareSize / 2);
    
    // Save the current context state
    ctx.save();
    
    // Translate to the center of the spawn shape
    ctx.translate(centerX, centerY);
    
    // Apply rotation (convert degrees to radians)
    const rotationRadians = (spawnRotation * Math.PI) / 180;
    ctx.rotate(rotationRadians);
    
    // Draw the rectangle centered at the origin (after translation)
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(-halfSize, -halfSize, spawnSquareSize, spawnSquareSize);
    ctx.setLineDash([]);
    
    // Restore the context state
    ctx.restore();
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
  console.log('!!! animation loop isRunning: ' + isRunning)
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
