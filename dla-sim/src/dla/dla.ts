// Types for DLA simulation
export type Point = { x: number; y: number };

export interface DLAState {
  width: number;
  height: number;
  cluster: Set<string>; // Set of 'x,y' strings for cluster points
  walkers: Point[];
  steps: number;
}

// Helper to serialize a point for Set
function pointKey(p: Point): string {
  return `${p.x},${p.y}`;
}

// Create initial DLA state
export function createDLAState(width: number, height: number, numWalkers: number): DLAState {
  // Start with a single cluster point at the center
  const cluster = new Set<string>();
  const center = { x: Math.floor(width / 2), y: Math.floor(height / 2) };
  cluster.add(pointKey(center));

  // Spawn walkers randomly on the border
  const walkers: Point[] = [];
  for (let i = 0; i < numWalkers; i++) {
    let edge = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    if (edge === 0) { // top
      x = Math.floor(Math.random() * width);
      y = 0;
    } else if (edge === 1) { // bottom
      x = Math.floor(Math.random() * width);
      y = height - 1;
    } else if (edge === 2) { // left
      x = 0;
      y = Math.floor(Math.random() * height);
    } else { // right
      x = width - 1;
      y = Math.floor(Math.random() * height);
    }
    walkers.push({ x, y });
  }

  return {
    width,
    height,
    cluster,
    walkers,
    steps: 0,
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
