import { stepDLA } from '../../dla/dla';
import type { ClusterMap } from '../../dla/dla';

// Types for messages
interface SimulateMessage {
  type: 'simulate';
  width: number;
  height: number;
  dlaState: {
    cluster: ClusterMap;
    walkers: { x: number; y: number }[];
    steps: number;
  };
  progressInterval?: number;
}

self.onmessage = function(e) {
  try {
    const data = e.data as SimulateMessage;
      if (data.type === 'simulate') {
    // Reconstruct the DLA state from the passed data
    let dlaState = {
      width: data.width,
      height: data.height,
      cluster: data.dlaState.cluster,
      walkers: data.dlaState.walkers,
      steps: data.dlaState.steps
    };
    
    let steps = dlaState.steps;
    const progressInterval = data.progressInterval || 1000;
    while (dlaState.walkers.length > 0) {
      dlaState = stepDLA(dlaState);
      steps++;
      if (steps % progressInterval === 0) {
        self.postMessage({ 
          type: 'progress', 
          steps, 
          walkers: dlaState.walkers.length,
          walkerPositions: dlaState.walkers
        });
      }
    }
    self.postMessage({ type: 'done', steps, cluster: dlaState.cluster });
  }
  } catch (error) {
    self.postMessage({ type: 'error', error: (error as Error).message });
  }
}; 