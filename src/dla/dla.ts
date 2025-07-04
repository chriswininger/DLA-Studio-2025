export type Point = { x: number; y: number };

export interface DLAState {
  width: number;
  height: number;
  
  // Clusters are the points that have stuck
  // The field is initailized with at least one initial cluster
  cluster: Set<string>;

  // Walkers are the points that are still moving
  walkers: Point[];
  steps: number;
}

// Create initial DLA state
export function createDLAState(width: number, height: number, numWalkers: number, spawnSquareSize?: number): DLAState {
  // Start with a single cluster point at the center
  const cluster = new Set<string>();
  const center = { x: Math.floor(width / 2), y: Math.floor(height / 2) };

  //clusters are tracked using strings for easy lookup
  cluster.add(pointKey(center));

  // Seeds the walkers randomly along the borders of the canvas or within a square
  const walkers: Point[] = [];
 
  if (spawnSquareSize && spawnSquareSize > 0) {
    // Spawn walkers randomly within a square centered on the canvas
    const half = Math.floor(spawnSquareSize / 2);
    for (let i = 0; i < numWalkers; i++) {
      const x = center.x - half + Math.floor(Math.random() * spawnSquareSize);
      const y = center.y - half + Math.floor(Math.random() * spawnSquareSize);
      walkers.push({ x, y });
    }
  } else {
    // Default: spawn walkers along the borders
    const distanceFromTheEdge = 1;
    for (let i = 0; i < numWalkers; i++) {
      const edge = Math.floor(Math.random() * 4);
      let x = 0, y = 0;
      if (edge === 0) { // top
        x = Math.floor(Math.random() * (width - distanceFromTheEdge));
        y = 0;
      } else if (edge === 1) { // bottom
        x = Math.floor(Math.random() * (width - distanceFromTheEdge));
        y = height - distanceFromTheEdge;
      } else if (edge === 2) { // left
        x = 0;
        y = Math.floor(Math.random() * (height - distanceFromTheEdge));
      } else { // right
        x = width - distanceFromTheEdge;
        y = Math.floor(Math.random() * (height - distanceFromTheEdge));
      }
      walkers.push({ x, y });
    }
  }

  return {
    width,
    height,
    cluster,
    walkers,
    steps: 0,
  };
}

// Advance the simulation by one step (pure function)
export function stepDLA(state: DLAState): DLAState {
  const { width, height, cluster } = state;
  const newCluster = new Set(cluster);
  const newWalkers: Point[] = [];

  for (const walker of state.walkers) {
    // Move walker randomly
    const dir = Math.floor(Math.random() * 4);
    let { x, y } = walker;
    if (dir === 0) x++;
    else if (dir === 1) x--;
    else if (dir === 2) y++;
    else y--;
    // Clamp to bounds
    x = Math.max(0, Math.min(width - 1, x));
    y = Math.max(0, Math.min(height - 1, y));
    const moved = { x, y };
    // Check if adjacent to cluster
    const stuck = neighbors(moved).some(n => cluster.has(pointKey(n)));
    if (stuck) {
      newCluster.add(pointKey(moved));
    } else {
      newWalkers.push(moved);
    }
  }

  return {
    ...state,
    cluster: newCluster,
    walkers: newWalkers,
    steps: state.steps + 1,
  };
}

// Get 4-neighbor positions
function neighbors(p: Point): Point[] {
  return [
    { x: p.x + 1, y: p.y },
    { x: p.x - 1, y: p.y },
    { x: p.x, y: p.y + 1 },
    { x: p.x, y: p.y - 1 },
  ];
}


// Helper to serialize a point for Set
function pointKey(p: Point): string {
  return `${p.x},${p.y}`;
}

