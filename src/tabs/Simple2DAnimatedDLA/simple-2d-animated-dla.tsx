import React, { useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAppSelector } from '../../store';
import { setIsRunning, saveDLAState, resetDLAState, setIsSimulating } from './simple-2d-animated-dla-slice';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './simple-2d-animated-dla-constants';
import { createDLAState, stepDLA } from '../../dla/dla';
import type { DLAState, ClusterMap } from '../../dla/dla';
import type { RootState } from '../../store';
import type { Simple2DAnimatedDLAUIState } from './simple-2d-animated-dla-slice';
import './simple-2d-animated-dla.css';
import ToolBar from './tool-bar/tool-bar';
import ShapeSpawnControls from './shape-spawn-controls/shape-spawn-controls';
import PaintBrushControls from './paint-brush-controls/paint-brush-controls';
import EraserControls from './eraser-controls/eraser-controls';
import { getColorForDistance } from '../DistanceGradient/distance-gradient-slice';
import { useAnalytics } from '../../analytics/useAnalytics.ts';
// Vite/ESM native worker import
// No import needed, use new Worker(new URL(...), { type: 'module' })

const Simple2DAnimatedDLA: React.FC = () => {
  const spawnPreviewColor = '#ffff00';
  const { trackUserInteraction } = useAnalytics();

  const dispatch = useDispatch();
  const {
    isRunning,
    isSimulating,
    spawnXOffset,
    spawnYOffset,
    spawnRotation,
    spawnSquareSize,
    selectedTool,
    brushSize,
    brushParticles,
    eraserSize,
    dlaCluster,
    dlaWalkers,
    dlaSteps
  } = useSimple2dAnimatedDLAState();

  const colorStops = useSelector((state: any) => state.distanceGradient.colorStops);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dlaStateRef = useRef<DLAState | null>(null);

  const [steps, setSteps] = React.useState(0);
  const [cursorPosition, setCursorPosition] = React.useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const workerRef = React.useRef<Worker | null>(null);
  const shouldShowSpawnShapePreview = selectedTool === 'spawn-shapes' && !isRunning;
  const shouldShowBrushPreview = selectedTool === 'brush' && !isRunning;
  const shouldShowEraserPreview = selectedTool === 'eraser' && !isRunning;

  const stepAnimation = useCallback(doStepAnimation, [doDraw, dispatch]);
  const walkersCount = dlaStateRef.current?.walkers.length ?? 0;

  useEffect(initializeState, []);

  useAnimationLoop(stepAnimation, isRunning);



  // Save DLA state when component unmounts or when switching tabs
  useEffect(() => {
    return () => {
      if (dlaStateRef.current) {
        dispatch(saveDLAState({
          cluster: dlaStateRef.current.cluster,
          walkers: dlaStateRef.current.walkers,
          steps: dlaStateRef.current.steps
        }));
      }
    };
  }, [dispatch]);


  useEffect(function () {
    doDraw();
  }, [selectedTool, spawnXOffset, spawnYOffset, spawnRotation, spawnSquareSize, cursorPosition, eraserSize]);

  // Mouse event handlers for cursor tracking
  const handleMouseMove = useHandleMouseMoveInCanvas({
    shouldShowBrushPreview,
    shouldShowEraserPreview,
    isDragging,
    canvasRef,
    setCursorPosition,
    spawnWalkersInBrushRadius,
    spawnStickyPointsInBrushRadius,
    removeWalkersInEraserRadius,
    removeStuckPointsInEraserRadius
  });

  const handleMouseLeave = useCallback(() => {
    setCursorPosition(null);
    setIsDragging(false);
  }, []);

  const handleMouseDown = useCallback(mouseDown, [selectedTool, isRunning, brushSize, brushParticles]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <>
      <title>DLA Studio - 2D Simulation</title>
      <meta name="description" content="Run a real-time, interactive 2D Diffusion-Limited Aggregation (DLA) simulation. Watch fractal patterns emerge as particles aggregate." />
      <div className={`dlasim-simple-2d-animated-dla-tab
    ${selectedTool === 'brush' ? 'brush-active' : ''}
    ${selectedTool === 'eraser' ? 'eraser-active' : ''}`}
    >
      <div className="dlasim-flex-row">
        {/* Tool selection UI */}
        <ToolBar />
        {/* Canvas and button row column */}
        <div className="dlasim_canvas-col">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="dlasim-canvas"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
          <div className="dlasim_button-row">
            {!isRunning ? (
              <button onClick={handleStart}>
                Start
              </button>
            ) : (
              <button onClick={handleStop}>
                Stop
              </button>
            )}
            <button onClick={handleReset} disabled={isRunning}>Reset</button>
            <button
              onClick={handleSimulateToCompletion}
              disabled={isRunning || isSimulating}
              >
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
    </>
  );

  // Handle start/stop/reset
  function handleStart() {
    console.info("started")
    trackUserInteraction('start_simulation', 'simulation_started');
    dispatch(setIsRunning(true));
  }

  function handleStop() {
    trackUserInteraction('stop_simulation', 'simulation_stopped');
    dispatch(setIsRunning(false));
  }

  function handleReset() {
    trackUserInteraction('reset_simulation', 'simulation_reset');
    dispatch(setIsRunning(false));
    dispatch(resetDLAState());
    dlaStateRef.current = createDLAState(CANVAS_WIDTH, CANVAS_HEIGHT);
    setSteps(0);
    doDraw();
  }

  // Simulate to completion (no animation frames)
  function handleSimulateToCompletion() {
    trackUserInteraction('simulate_to_completion', 'simulation_completion_started');
    dispatch(setIsSimulating(true));
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
          dlaStateRef.current.cluster = msg.cluster;
          dlaStateRef.current.walkers = [];
          dlaStateRef.current.steps = msg.steps;
        }
        doDraw();
        dispatch(setIsSimulating(false));
        workerRef.current?.terminate();
        workerRef.current = null;
        dispatch(setIsRunning(false));
      } else if (msg.type === 'error') {
        console.error('Worker error:', msg.error);
        dispatch(setIsSimulating(false));
        workerRef.current?.terminate();
        workerRef.current = null;
      }
    };
    // Prepare the current DLA state for the worker
    const currentState = dlaStateRef.current;
    if (!currentState) {
      console.error('No DLA state available for simulation');
      dispatch(setIsSimulating(false));
      return;
    }

    workerRef.current.postMessage({
      type: 'simulate',
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      dlaState: {
        cluster: currentState.cluster,
        walkers: currentState.walkers,
        steps: currentState.steps
      },
      progressInterval: 1000,
    });
  }

  function handleSpawn(newWalkers: { x: number; y: number }[]) {
    if (dlaStateRef.current) {
      console.log('Current cluster size:', Object.keys(dlaStateRef.current.cluster).length);
      console.log('Cluster positions:', Object.keys(dlaStateRef.current.cluster));
      console.log('Spawning walkers:', newWalkers.length);

      trackUserInteraction('spawn_walkers', `spawned_${newWalkers.length}_walkers`);
      dlaStateRef.current.walkers = [...dlaStateRef.current.walkers, ...newWalkers];
      doDraw();
    }
  }

  function doStepAnimation(): boolean {
    if (dlaStateRef.current) {
      dlaStateRef.current = stepDLA(dlaStateRef.current);
      setSteps(prev => prev + 1);
      doDraw();
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

    if (shouldShowSpawnShapePreview) {
      drawShapeSpawn(ctx);
    }

    // Draw cluster with gradient coloring by distance
    const clusterEntries = Object.values(dlaStateRef.current.cluster);
    const distances = clusterEntries.map(entry => entry.distance ?? 0);
    const minDistance = Math.min(...distances);
    const maxDistance = Math.max(...distances);
    clusterEntries.forEach((entry) => {
      const { x, y } = entry.point;
      const color = getColorForDistance(colorStops, entry.distance ?? 0, minDistance, maxDistance);
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    });

    // Draw walkers
    ctx.fillStyle = '#ff0080';
    dlaStateRef.current.walkers.forEach(({ x, y }: { x: number; y: number }) => {
      ctx.fillRect(x, y, 1, 1);
    });

    // Draw brush preview
    if (shouldShowBrushPreview && cursorPosition) {
      drawBrushPreview(ctx, cursorPosition, brushSize);
    }

    // Draw eraser preview
    if (shouldShowEraserPreview && cursorPosition) {
      drawEraserPreview(ctx, cursorPosition, eraserSize);
    }
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
    ctx.strokeStyle = spawnPreviewColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(-halfSize, -halfSize, spawnSquareSize, spawnSquareSize);
    ctx.setLineDash([]);

    // Restore the context state
    ctx.restore();
  }

  function drawBrushPreview(ctx: CanvasRenderingContext2D, position: { x: number; y: number }, size: number) {
    const radius = size / 2;

    ctx.save();

    // Draw brush preview circle
    ctx.strokeStyle = spawnPreviewColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw center point
    ctx.fillStyle = spawnPreviewColor;
    ctx.fillRect(position.x - 1, position.y - 1, 2, 2);

    ctx.restore();
  }

  function drawEraserPreview(ctx: CanvasRenderingContext2D, position: { x: number; y: number }, size: number) {
    const radius = size / 2;

    ctx.save();

    // Draw eraser preview circle with red color to distinguish from brush
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]); // Dashed line to indicate eraser
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw center point
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(position.x - 1, position.y - 1, 2, 2);

    ctx.restore();
  }


  function spawnWalkersInBrushRadius(centerX: number, centerY: number, brushSize: number, numWalkers: number) {
    if (!dlaStateRef.current) return;

    const radius = brushSize / 2;
    const walkers: { x: number; y: number }[] = [];

    for (let i = 0; i < numWalkers; i++) {
      const point = generateRandomPointInBrushCircle(centerX, centerY, radius);
      walkers.push(point);
    }

    // Add walkers to the current state
    dlaStateRef.current.walkers = [...dlaStateRef.current.walkers, ...walkers];
    doDraw();
  }

  function spawnStickyPointsInBrushRadius(centerX: number, centerY: number, brushSize: number, numPoints: number) {
    if (!dlaStateRef.current) return;

    const radius = brushSize / 2;
    const newCluster: ClusterMap = {};

    for (let i = 0; i < numPoints; i++) {
      const point = generateRandomPointInBrushCircle(centerX, centerY, radius);
      const pointKey = `${point.x},${point.y}`;

      // Only add if the point doesn't already exist in the cluster
      if (!dlaStateRef.current.cluster[pointKey]) {
        newCluster[pointKey] = {
          point,
          distance: 0,
          parent: 'ROOT'
        };
      }
    }

    // Add new cluster points to the current state
    dlaStateRef.current.cluster = { ...dlaStateRef.current.cluster, ...newCluster };
    doDraw();
  }

  function generateRandomPointInBrushCircle(centerX: number, centerY: number, radius: number): { x: number; y: number } {
    // Generate random angle and distance within the circle
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;

    // Convert polar coordinates to Cartesian
    const x = Math.floor(centerX + distance * Math.cos(angle));
    const y = Math.floor(centerY + distance * Math.sin(angle));

    // Clamp to canvas bounds
    const clampedX = Math.max(0, Math.min(CANVAS_WIDTH - 1, x));
    const clampedY = Math.max(0, Math.min(CANVAS_HEIGHT - 1, y));

    return { x: clampedX, y: clampedY };
  }

  function removeWalkersInEraserRadius(centerX: number, centerY: number, eraserSize: number) {
    if (!dlaStateRef.current) return;

    const radius = eraserSize / 2;
    const radiusSquared = radius * radius;

    // Filter out walkers that are within the eraser radius
    dlaStateRef.current.walkers = dlaStateRef.current.walkers.filter(walker => {
      const dx = walker.x - centerX;
      const dy = walker.y - centerY;
      const distanceSquared = dx * dx + dy * dy;
      return distanceSquared > radiusSquared;
    });

    doDraw();
  }

  function removeStuckPointsInEraserRadius(centerX: number, centerY: number, eraserSize: number) {
    if (!dlaStateRef.current) return;

    const radius = eraserSize / 2;
    const radiusSquared = radius * radius;

    // Filter out cluster points that are within the eraser radius
    const newCluster: ClusterMap = {};
    for (const [key, entry] of Object.entries(dlaStateRef.current.cluster)) {
      const dx = entry.point.x - centerX;
      const dy = entry.point.y - centerY;
      const distanceSquared = dx * dx + dy * dy;
      
      if (distanceSquared > radiusSquared) {
        newCluster[key] = entry;
      }
    }

    dlaStateRef.current.cluster = newCluster;
    doDraw();
  }

  function initializeState() {
    // Only initialize cluster and walkers on first mount or reset
    if (!dlaStateRef.current) {
      // Check if we have saved state in Redux
      if (Object.keys(dlaCluster).length > 0 || dlaWalkers.length > 0) {
        // Load from saved state
        dlaStateRef.current = {
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          cluster: dlaCluster,
          walkers: dlaWalkers,
          steps: dlaSteps
        };
        setSteps(dlaSteps);
      } else {
        // Create new state
        dlaStateRef.current = createDLAState(CANVAS_WIDTH, CANVAS_HEIGHT);
        setSteps(0);
      }
      doDraw();
    }
  }

  function mouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if ((selectedTool === 'brush' || selectedTool === 'eraser') && !isRunning) {
      setIsDragging(true);
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      if (coords) {
        setCursorPosition(coords);
        if (selectedTool === 'brush') {
          spawnWalkersInBrushRadius(coords.x, coords.y, brushSize, brushParticles);
        } else if (selectedTool === 'eraser') {
          removeWalkersInEraserRadius(coords.x, coords.y, eraserSize);
        }
      }
    }
  }

  // Helper function to get accurate coordinates accounting for canvas scaling
  function getCanvasCoordinates(clientX: number, clientY: number): { x: number; y: number } | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    return { x, y };
  }

  function handleTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    if ((selectedTool === 'brush' || selectedTool === 'eraser') && !isRunning) {
      // Only prevent default behavior when using drawing tools
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(true);
      const coords = getCanvasCoordinates(e.touches[0].clientX, e.touches[0].clientY);
      if (coords) {
        setCursorPosition(coords);
        if (selectedTool === 'brush') {
          spawnWalkersInBrushRadius(coords.x, coords.y, brushSize, brushParticles);
        } else if (selectedTool === 'eraser') {
          removeWalkersInEraserRadius(coords.x, coords.y, eraserSize);
        }
      }
    }
  }

  function handleTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
    if ((selectedTool === 'brush' || selectedTool === 'eraser') && !isRunning) {
      // Only prevent default behavior when using drawing tools
      e.preventDefault();
      e.stopPropagation();

      const coords = getCanvasCoordinates(e.touches[0].clientX, e.touches[0].clientY);
      if (coords) {
        setCursorPosition(coords);
        if (isDragging) {
          if (selectedTool === 'brush') {
            spawnWalkersInBrushRadius(coords.x, coords.y, brushSize, brushParticles);
          } else if (selectedTool === 'eraser') {
            removeWalkersInEraserRadius(coords.x, coords.y, eraserSize);
          }
        }
      }
    }
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLCanvasElement>) {
    // Prevent any default touch behaviors
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setCursorPosition(null);
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

// Custom hook to select all Simple2DAnimatedDLA state from Redux
function useSimple2dAnimatedDLAState() {
  const isRunning = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).isRunning);
  const isSimulating = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).isSimulating);
  const spawnXOffset = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).spawnXOffset);
  const spawnYOffset = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).spawnYOffset);
  const spawnRotation = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).spawnRotation);
  const spawnSquareSize = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).spawnSquareSize);
  const selectedTool = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).selectedTool);
  const brushSize = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).brushSize);
  const brushParticles = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).brushParticles);
  const eraserSize = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).eraserSize);
  const dlaCluster = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).dlaCluster);
  const dlaWalkers = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).dlaWalkers);
  const dlaSteps = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).dlaSteps);
  return {
    isRunning,
    isSimulating,
    spawnXOffset,
    spawnYOffset,
    spawnRotation,
    spawnSquareSize,
    selectedTool,
    brushSize,
    brushParticles,
    eraserSize,
    dlaCluster,
    dlaWalkers,
    dlaSteps
  };
}

// Custom hook for mouse move handling on the canvas
function useHandleMouseMoveInCanvas({
  shouldShowBrushPreview,
  shouldShowEraserPreview,
  isDragging,
  canvasRef,
  setCursorPosition,
  spawnWalkersInBrushRadius,
  spawnStickyPointsInBrushRadius,
  removeWalkersInEraserRadius,
  removeStuckPointsInEraserRadius
}: {
  shouldShowBrushPreview: boolean;
  shouldShowEraserPreview: boolean;
  isDragging: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  setCursorPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  spawnWalkersInBrushRadius: (x: number, y: number, brushSize: number, numWalkers: number) => void;
  spawnStickyPointsInBrushRadius: (x: number, y: number, brushSize: number, numPoints: number) => void;
  removeWalkersInEraserRadius: (x: number, y: number, eraserSize: number) => void;
  removeStuckPointsInEraserRadius: (x: number, y: number, eraserSize: number) => void;
}) {
  const isRunning = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).isRunning);
  const selectedTool = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).selectedTool);
  const brushSize = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).brushSize);
  const brushParticles = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).brushParticles);
  const brushSpawnType = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).brushSpawnType);
  const eraseParticleType = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).eraseParticleType);
  const eraserSize = useAppSelector((state: RootState) => (state.simple2dAnimatedDla as Simple2DAnimatedDLAUIState).eraserSize);

  return React.useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (shouldShowBrushPreview || shouldShowEraserPreview) {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        setCursorPosition({ x, y });
        // If dragging, handle tool operations
        if (isDragging && !isRunning) {
          if (selectedTool === 'brush') {
            if (brushSpawnType === 'walkers') {
              spawnWalkersInBrushRadius(x, y, brushSize, brushParticles);
            } else if (brushSpawnType === 'stuck points') {
              spawnStickyPointsInBrushRadius(x, y, brushSize, brushParticles);
            }
          } else if (selectedTool === 'eraser') {
            if (eraseParticleType === 'walkers') {
              removeWalkersInEraserRadius(x, y, eraserSize);
            } else if (eraseParticleType === 'stuck points') {
              removeStuckPointsInEraserRadius(x, y, eraserSize);
            }
          }
        }
      }
    }
  }, [shouldShowBrushPreview, shouldShowEraserPreview, isDragging, selectedTool, isRunning, brushSize, brushParticles, brushSpawnType, eraseParticleType, eraserSize, canvasRef, setCursorPosition, spawnWalkersInBrushRadius, spawnStickyPointsInBrushRadius, removeWalkersInEraserRadius, removeStuckPointsInEraserRadius]);
}

export default Simple2DAnimatedDLA;
