import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../store';
import type { RootState } from '../../store';
import { setIsRunning, saveDLA3DState, resetState } from './three-dimensional-dla-slice';
import { createDLA3DState, stepDLA3D, ORIGIN_KEY } from './dla-3d';
import type { DLA3DState } from './dla-3d';
import {
  BOUND_HALF_EXTENT,
  MAX_WALKERS,
  MAX_CLUSTER,
  MAX_CONNECTIONS,
  DEFAULT_CENTER_STICKY, DEFAULT_FLOOR_STICKY
} from './three-dimensional-dla-constants';
import SphereSpawnControls from './sphere-spawn-controls/sphere-spawn-controls';
import SimulationControls from './simulation-controls/simulation-controls';
import BlenderExport from './blender-export/blender-export';
import './three-dimensional-dla.css';

const STATUS_UPDATE_INTERVAL = 10;
const HIDDEN_POSITION = new THREE.Matrix4().makeTranslation(0, -9999, 0);

function ThreeDimensionalDLA() {
  const dispatch = useDispatch();
  const isRunning = useAppSelector((state: RootState) => state.threeDimensionalDla.isRunning);
  const reduxWalkers = useAppSelector((state: RootState) => state.threeDimensionalDla.walkers);
  const reduxCluster = useAppSelector((state: RootState) => state.threeDimensionalDla.cluster);
  const reduxSteps = useAppSelector((state: RootState) => state.threeDimensionalDla.steps);
  const stickDistance = useAppSelector((state: RootState) => state.threeDimensionalDla.stickDistance);
  const centerSticky = useAppSelector((state: RootState) => state.threeDimensionalDla.centerSticky);
  const floorSticky = useAppSelector((state: RootState) => state.threeDimensionalDla.floorSticky);

  const dlaStateRef = useRef<DLA3DState | null>(null);
  const [statusText, setStatusText] = React.useState('Steps: 0 | Walkers: 0 | Cluster: 1');

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

  useEffect(() => {
    if (dlaStateRef.current) {
      dlaStateRef.current.stickDistance = stickDistance;
    }
  }, [stickDistance]);

  useEffect(() => {
    if (dlaStateRef.current) {
      dlaStateRef.current.centerSticky = centerSticky;
      if (centerSticky && !(ORIGIN_KEY in dlaStateRef.current.cluster)) {
        dlaStateRef.current.cluster = {
          ...dlaStateRef.current.cluster,
          [ORIGIN_KEY]: { point: { x: 0, y: 0, z: 0 }, distance: 0, parent: 'ROOT' as const, parentPoint: null },
        };
      } else if (!centerSticky && ORIGIN_KEY in dlaStateRef.current.cluster) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [ORIGIN_KEY]: _removed, ...rest } = dlaStateRef.current.cluster;
        dlaStateRef.current.cluster = rest;
      }
    }
  }, [centerSticky]);

  useEffect(() => {
    if (dlaStateRef.current) {
      dlaStateRef.current.floorSticky = floorSticky;
    }
  }, [floorSticky]);

  return (
    <div className="dlasim-three-dimensional-dla">
      <div className="dlasim-3d-flex-row">
        <div className="dlasim-3d-canvas-col">
          <div className="dlasim-3d-canvas-container">
            <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <BoundingBox halfExtent={BOUND_HALF_EXTENT} />
              <InstancedWalkers dlaStateRef={dlaStateRef} />
              <InstancedCluster dlaStateRef={dlaStateRef} />
              <ClusterLines dlaStateRef={dlaStateRef} />
              <SimulationLoop
                dlaStateRef={dlaStateRef}
                isRunning={isRunning}
                setStatusText={setStatusText}
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
            <BlenderExport dlaStateRef={dlaStateRef} />
          </div>
          <div className="dlasim-3d-status-row">
            {statusText}
          </div>
        </div>
        <div className="dlasim-3d-controls-col">
          <SphereSpawnControls isRunning={isRunning} />
          <SimulationControls isRunning={isRunning} centerSticky={centerSticky} floorSticky={floorSticky} />
        </div>
      </div>
    </div>
  );

  function handleStart() {
    dispatch(setIsRunning(true));
  }

  function handleStop() {
    dispatch(setIsRunning(false));
    updateStatusText();
  }

  function handleReset() {
    dispatch(resetState());
    dlaStateRef.current = createDLA3DState(BOUND_HALF_EXTENT, stickDistance, centerSticky, floorSticky);
    updateStatusText();
  }

  function handleFinished() {
    dispatch(setIsRunning(false));
    updateStatusText();
  }

  function updateStatusText() {
    if (!dlaStateRef.current) return;
    const s = dlaStateRef.current;
    setStatusText(`Steps: ${s.steps} | Walkers: ${s.walkers.length} | Cluster: ${Object.keys(s.cluster).length}`);
  }

  function syncSpawnedWalkers() {
    if (dlaStateRef.current && reduxWalkers.length > 0) {
      dlaStateRef.current.walkers = [...reduxWalkers];
      updateStatusText();
    }
  }

  function initializeState() {
    if (!dlaStateRef.current) {
      if (Object.keys(reduxCluster).length > 0 || reduxWalkers.length > 0) {
        dlaStateRef.current = {
          centerSticky: DEFAULT_CENTER_STICKY,
          floorSticky: DEFAULT_FLOOR_STICKY,
          cluster: reduxCluster,
          walkers: reduxWalkers,
          steps: reduxSteps,
          stepSize: 0.2,
          stickDistance,
          boundHalfExtent: BOUND_HALF_EXTENT
        };
      } else {
        dlaStateRef.current = createDLA3DState(BOUND_HALF_EXTENT, stickDistance, centerSticky, floorSticky);
      }
      updateStatusText();
    }
  }
}

interface SimulationLoopProps {
  dlaStateRef: React.RefObject<DLA3DState | null>;
  isRunning: boolean;
  setStatusText: (text: string) => void;
  onFinished: () => void;
}

function SimulationLoop({ dlaStateRef, isRunning, setStatusText, onFinished }: SimulationLoopProps) {
  const onFinishedRef = useRef(onFinished);
  const setStatusTextRef = useRef(setStatusText);
  onFinishedRef.current = onFinished;
  setStatusTextRef.current = setStatusText;

  useFrame(() => {
    if (!isRunning || !dlaStateRef.current) return;

    dlaStateRef.current = stepDLA3D(dlaStateRef.current);

    if (dlaStateRef.current.steps % STATUS_UPDATE_INTERVAL === 0) {
      const s = dlaStateRef.current;
      setStatusTextRef.current(
        `Steps: ${s.steps} | Walkers: ${s.walkers.length} | Cluster: ${Object.keys(s.cluster).length}`
      );
    }

    if (dlaStateRef.current.walkers.length === 0) {
      onFinishedRef.current();
    }
  });

  return null;
}

function InstancedWalkers({ dlaStateRef }: { dlaStateRef: React.RefObject<DLA3DState | null> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempMatrix = useRef(new THREE.Matrix4());

  useFrame(() => {
    const mesh = meshRef.current;
    const state = dlaStateRef.current;
    if (!mesh || !state) return;

    for (let i = 0; i < MAX_WALKERS; i++) {
      if (i < state.walkers.length) {
        const w = state.walkers[i];
        tempMatrix.current.makeTranslation(w.x, w.y, w.z);
      } else {
        tempMatrix.current.copy(HIDDEN_POSITION);
      }
      mesh.setMatrixAt(i, tempMatrix.current);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.count = state.walkers.length;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_WALKERS]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color="#ff0080" />
    </instancedMesh>
  );
}

function InstancedCluster({ dlaStateRef }: { dlaStateRef: React.RefObject<DLA3DState | null> }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempMatrix = useRef(new THREE.Matrix4());
  const tempColor = useRef(new THREE.Color());
  const prevClusterSize = useRef(0);

  useFrame(() => {
    const mesh = meshRef.current;
    const state = dlaStateRef.current;
    if (!mesh || !state) return;

    const entries = Object.values(state.cluster);
    const count = Math.min(entries.length, MAX_CLUSTER);

    if (count !== prevClusterSize.current) {
      for (let i = prevClusterSize.current; i < count; i++) {
        const entry = entries[i];
        tempMatrix.current.makeTranslation(entry.point.x, entry.point.y, entry.point.z);
        mesh.setMatrixAt(i, tempMatrix.current);

        const hue = entry.distance === 0 ? 0 : (entry.distance * 30) % 360;
        const lightness = entry.distance === 0 ? 1.0 : 0.55;
        const saturation = entry.distance === 0 ? 0.0 : 0.8;
        tempColor.current.setHSL(hue / 360, saturation, lightness);
        mesh.setColorAt(i, tempColor.current);
      }

      mesh.count = count;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      prevClusterSize.current = count;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_CLUSTER]}>
      <sphereGeometry args={[0.12, 8, 8]} />
      <meshStandardMaterial />
    </instancedMesh>
  );
}

function ClusterLines({ dlaStateRef }: { dlaStateRef: React.RefObject<DLA3DState | null> }) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const positionsRef = useRef(new Float32Array(MAX_CONNECTIONS * 6));
  const prevLineCount = useRef(0);

  const geom = React.useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(MAX_CONNECTIONS * 6);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setDrawRange(0, 0);
    return geometry;
  }, []);

  useFrame(() => {
    const line = lineRef.current;
    const state = dlaStateRef.current;
    if (!line || !state) return;

    const entries = Object.values(state.cluster);
    let lineCount = 0;
    for (let i = 0; i < entries.length && lineCount < MAX_CONNECTIONS; i++) {
      const entry = entries[i];
      if (!entry.parentPoint) continue;
      lineCount++;
    }

    if (lineCount === prevLineCount.current) return;

    const positions = positionsRef.current;
    let idx = 0;
    for (let i = 0; i < entries.length && idx < MAX_CONNECTIONS * 6; i++) {
      const entry = entries[i];
      if (!entry.parentPoint) continue;
      positions[idx++] = entry.point.x;
      positions[idx++] = entry.point.y;
      positions[idx++] = entry.point.z;
      positions[idx++] = entry.parentPoint.x;
      positions[idx++] = entry.parentPoint.y;
      positions[idx++] = entry.parentPoint.z;
    }

    const attr = geom.getAttribute('position') as THREE.BufferAttribute;
    attr.array.set(positions);
    attr.needsUpdate = true;
    geom.setDrawRange(0, (idx / 3));
    prevLineCount.current = lineCount;
  });

  return (
    <lineSegments ref={lineRef} geometry={geom}>
      <lineBasicMaterial color="#66aaff" opacity={0.6} transparent />
    </lineSegments>
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

export default ThreeDimensionalDLA;
