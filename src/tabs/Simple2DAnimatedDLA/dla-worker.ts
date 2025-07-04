import { createDLAState, stepDLA } from '../../dla/dla';

// Types for messages
interface SimulateMessage {
  type: 'simulate';
  width: number;
  height: number;
  numWalkers: number;
  spawnSquareSize?: number;
  progressInterval?: number;
}

self.onmessage = function(e) {
  const data = e.data as SimulateMessage;
  if (data.type === 'simulate') {
    let dlaState = createDLAState(data.width, data.height, data.numWalkers, data.spawnSquareSize);
    let steps = 0;
    const progressInterval = data.progressInterval || 1000;
    while (dlaState.walkers.length > 0) {
      dlaState = stepDLA(dlaState);
      steps++;
      if (steps % progressInterval === 0) {
        self.postMessage({ type: 'progress', steps, walkers: dlaState.walkers.length });
      }
    }
    self.postMessage({ type: 'done', steps, cluster: Array.from(dlaState.cluster) });
  }
}; 