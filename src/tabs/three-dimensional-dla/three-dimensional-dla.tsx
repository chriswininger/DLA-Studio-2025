import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../store';
import type { RootState } from '../../store';
import { setIsRunning, saveDLA3DState, resetState } from './three-dimensional-dla-slice';
import { createDLA3DState, stepDLA3D } from './dla-3d';
import type { DLA3DState, ClusterEntry3D } from './dla-3d';
import { BOUND_HALF_EXTENT } from './three-dimensional-dla-constants';
import SphereSpawnControls from './sphere-spawn-controls/sphere-spawn-controls';
import './three-dimensional-dla.css';

function ThreeDimensionalDLA() {
  const dispatch = useDispatch();
  const isRunning = useAppSelector((state: RootState) => state.threeDimensionalDla.isRunning);
  const reduxWalkers = useAppSelector((state: RootState) => state.threeDimensionalDla.walkers);
  const reduxCluster = useAppSelector((state: RootState) => state.threeDimensionalDla.cluster);
  const reduxSteps = useAppSelector((state: RootState) => state.threeDimensionalDla.steps);

  const dlaStateRef = useRef<DLA3DState | null>(null);
  const [steps, setSteps] = React.useState(0);
  const [walkerPositions, setWalkerPositions] = React.useState<{ x: number; y: number; z: number }[]>([]);
  const [clusterEntries, setClusterEntries] = React.useState<ClusterEntry3D[]>([]);

  useEffect(initializeState, []);

  useEffect(() => {
    return () => {
      if (dlaStateRef.current) {
        dispatch(saveDLA3DState({
          cluster: dlaStateRef.current.cluster,
          walkers: dlaStateRef.current.walkers,
          steps: dlaStateRef.current.steps,
        }));
      }
    };
  }, [dispatch]);

  useEffect(syncSpawnedWalkers, [reduxWalkers]);

  return (
    <div className="dlasim-three-dimensional-dla">
      <div className="dlasim-3d-flex-row">
        <div className="dlasim-3d-canvas-col">
          <div className="dlasim-3d-canvas-container">
            <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <BoundingBox halfExtent={BOUND_HALF_EXTENT} />
              <ClusterSpheres entries={clusterEntries} />
              <WalkerSpheres walkers={walkerPositions} />
              <SimulationLoop
                dlaStateRef={dlaStateRef}
                isRunning={isRunning}
                onStep={handleStepUpdate}
                onFinished={handleFinished}
              />
              <OrbitControls />
            </Canvas>
          </div>
          <div className="dlasim-3d-button-row">
            {!isRunning ? (
              <button onClick={handleStart}>Start</button>
            ) : (
              <button onClick={handleStop}>Stop</button>
            )}
            <button onClick={handleReset} disabled={isRunning}>Reset</button>
          </div>
          <div className="dlasim-3d-status-row">
            Steps: {steps} | Walkers: {walkerPositions.length} | Cluster: {clusterEntries.length}
          </div>
        </div>
        <SphereSpawnControls isRunning={isRunning} />
      </div>
    </div>
  );

  function handleStart() {
    dispatch(setIsRunning(true));
  }

  function handleStop() {
    dispatch(setIsRunning(false));
  }

  function handleReset() {
    dispatch(resetState());
    dlaStateRef.current = createDLA3DState(BOUND_HALF_EXTENT);
    setSteps(0);
    syncRenderState();
  }

  function handleStepUpdate() {
    if (dlaStateRef.current) {
      setSteps(dlaStateRef.current.steps);
      syncRenderState();
    }
  }

  function handleFinished() {
    dispatch(setIsRunning(false));
  }

  function syncRenderState() {
    if (!dlaStateRef.current) return;
    setWalkerPositions([...dlaStateRef.current.walkers]);
    setClusterEntries(Object.values(dlaStateRef.current.cluster));
  }

  function syncSpawnedWalkers() {
    if (dlaStateRef.current && reduxWalkers.length > 0) {
      dlaStateRef.current.walkers = [...reduxWalkers];
      syncRenderState();
    }
  }

  function initializeState() {
    if (!dlaStateRef.current) {
      if (Object.keys(reduxCluster).length > 0 || reduxWalkers.length > 0) {
        dlaStateRef.current = {
          cluster: reduxCluster,
          walkers: reduxWalkers,
          steps: reduxSteps,
          stepSize: 0.2,
          stickDistance: 0.3,
          boundHalfExtent: BOUND_HALF_EXTENT,
        };
        setSteps(reduxSteps);
      } else {
        dlaStateRef.current = createDLA3DState(BOUND_HALF_EXTENT);
        setSteps(0);
      }
      syncRenderState();
    }
  }
}

interface SimulationLoopProps {
  dlaStateRef: React.RefObject<DLA3DState | null>;
  isRunning: boolean;
  onStep: () => void;
  onFinished: () => void;
}

function SimulationLoop({ dlaStateRef, isRunning, onStep, onFinished }: SimulationLoopProps) {
  const onStepRef = useRef(onStep);
  const onFinishedRef = useRef(onFinished);
  onStepRef.current = onStep;
  onFinishedRef.current = onFinished;

  useFrame(() => {
    if (!isRunning || !dlaStateRef.current) return;

    dlaStateRef.current = stepDLA3D(dlaStateRef.current);
    onStepRef.current();

    if (dlaStateRef.current.walkers.length === 0) {
      onFinishedRef.current();
    }
  });

  return null;
}

interface WalkerSpheresProps {
  walkers: { x: number; y: number; z: number }[];
}

function WalkerSpheres({ walkers }: WalkerSpheresProps) {
  return (
    <>
      {walkers.map((w, i) => (
        <mesh key={i} position={[w.x, w.y, w.z]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#ff0080" />
        </mesh>
      ))}
    </>
  );
}

interface ClusterSpheresProps {
  entries: ClusterEntry3D[];
}

function ClusterSpheres({ entries }: ClusterSpheresProps) {
  return (
    <>
      {entries.map((entry, i) => (
        <mesh key={i} position={[entry.point.x, entry.point.y, entry.point.z]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color={getClusterColor(entry.distance)} />
        </mesh>
      ))}
    </>
  );
}

function BoundingBox({ halfExtent }: { halfExtent: number }) {
  const size = halfExtent * 2;
  return (
    <lineSegments>
      <edgesGeometry args={[new THREE.BoxGeometry(size, size, size)]} />
      <lineBasicMaterial color="#444466" />
    </lineSegments>
  );
}

function getClusterColor(distance: number): string {
  if (distance === 0) return '#ffffff';
  const hue = (distance * 30) % 360;
  return `hsl(${hue}, 80%, 55%)`;
}

export default ThreeDimensionalDLA;
