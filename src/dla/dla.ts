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
export function createDLAState(width: number, height: number): DLAState {
  // Start with a single cluster point at the center
  const cluster = new Set<string>();
  const center = { x: Math.floor(width / 2), y: Math.floor(height / 2) };

  //clusters are tracked using strings for easy lookup
  cluster.add(pointKey(center));

  const walkers: Point[] = [];

  return {
    width,
    height,
    cluster,
    walkers,
    steps: 0,
  };
}

export function spawnWalkersInSquare(width: number, height: number, numWalkers: number, spawnSquareSize: number): Point[] {
  const walkers: Point[] = [];

  const center = { x: Math.floor(width / 2), y: Math.floor(height / 2) };


  const half = Math.floor(spawnSquareSize / 2);
  for (let i = 0; i < numWalkers; i++) {
    const x = center.x - half + Math.floor(Math.random() * spawnSquareSize);
    const y = center.y - half + Math.floor(Math.random() * spawnSquareSize);
    walkers.push({ x, y });
  }

  return walkers;
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

