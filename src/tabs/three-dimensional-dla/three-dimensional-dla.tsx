import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../store';
import type { RootState } from '../../store';
import { setIsRunning, resetState } from './three-dimensional-dla-slice';
import SphereSpawnControls from './sphere-spawn-controls/sphere-spawn-controls';
import './three-dimensional-dla.css';

function ThreeDimensionalDLA() {
  const dispatch = useDispatch();
  const isRunning = useAppSelector((state: RootState) => state.threeDimensionalDla.isRunning);
  const walkers = useAppSelector((state: RootState) => state.threeDimensionalDla.walkers);

  return (
    <div className="dlasim-three-dimensional-dla">
      <div className="dlasim-3d-flex-row">
        <div className="dlasim-3d-canvas-col">
          <div className="dlasim-3d-canvas-container">
            <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1} />
              <Walkers walkers={walkers} />
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
            Walkers: {walkers.length}
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
  }
}

interface WalkersProps {
  walkers: { x: number; y: number; z: number }[];
}

function Walkers({ walkers }: WalkersProps) {
  return (
    <>
      {walkers.map((w, i) => (
        <mesh key={i} position={[w.x, w.y, w.z]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#ff0080" />
        </mesh>
      ))}
    </>
  );
}

export default ThreeDimensionalDLA;
