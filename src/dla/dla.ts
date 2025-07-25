export type Point = { x: number; y: number };

const ROOT = 'ROOT'

export interface ClusterEntry {
  point: Point,
  distance: number,
  parent: ClusterEntry | typeof ROOT
}

export interface ClusterMap {
  [key: string]: ClusterEntry
}

export interface DLAState {
  width: number;
  height: number;
  
  // Clusters are the points that have stuck
  // The field is initailized with at least one initial cluster
  cluster: ClusterMap;

  // Walkers are the points that are still moving
  walkers: Point[];
  steps: number;
}

// Create initial DLA state
export function createDLAState(width: number, height: number): DLAState {
  // Start with a single cluster point at the center
  const cluster: ClusterMap = {};
  const center = { x: Math.floor(width / 2), y: Math.floor(height / 2) };

  //clusters are tracked using strings for easy lookup
  cluster[pointKey(center)] = clusterEntry(center, ROOT);

  const walkers: Point[] = [];

  return {
    width,
    height,
    cluster,
    walkers,
    steps: 0,
  };
}

export function spawnWalkersInSquare(width: number, height: number, numWalkers: number, spawnSquareSize: number, xOffset: number = 0, yOffset: number = 0, rotation: number = 0): Point[] {
  const walkers: Point[] = [];

  const center = { x: Math.floor(width / 2) + xOffset, y: Math.floor(height / 2) + yOffset };
  const half = Math.floor(spawnSquareSize / 2);
  const rotationRadians = (rotation * Math.PI) / 180;
  
  console.log(`Spawning with rotation: ${rotation}° (${rotationRadians} radians)`);
  console.log(`Spawn center: (${center.x}, ${center.y})`);
  console.log(`Spawn area: ${spawnSquareSize}x${spawnSquareSize} centered at (${center.x}, ${center.y})`);
  
  for (let i = 0; i < numWalkers; i++) {
    // Generate random position within the square (before rotation)
    const randomX = -half + Math.floor(Math.random() * spawnSquareSize);
    const randomY = -half + Math.floor(Math.random() * spawnSquareSize);
    
    // Apply rotation transformation
    const rotatedX = randomX * Math.cos(rotationRadians) - randomY * Math.sin(rotationRadians);
    const rotatedY = randomX * Math.sin(rotationRadians) + randomY * Math.cos(rotationRadians);
    
    // Translate to the center position
    const x = Math.floor(center.x + rotatedX);
    const y = Math.floor(center.y + rotatedY);
    
    walkers.push({ x, y });
  }

  return walkers;
}

// Advance the simulation by one step (pure function)
export function stepDLA(state: DLAState): DLAState {
  const { width, height, cluster } = state;
  const newCluster: ClusterMap = {};
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
    const stuckNeighbor: Point | undefined = neighbors(moved)
      .find(n => !!cluster[pointKey(n)])
    

    if (!!stuckNeighbor) {
      const parent: ClusterEntry = cluster[pointKey(stuckNeighbor)]
      newCluster[pointKey(moved)] = clusterEntry(moved, parent, parent.distance + 1);
    } else {
      newWalkers.push(moved);
    }
  }

  return {
    ...state,
    cluster: { ...state.cluster, ...newCluster },
    walkers: newWalkers,
    steps: state.steps + 1,
  };
}

// Get 8 possilbe neighbor positions
function neighbors(p: Point): Point[] {
  return [
    { x: p.x + 1, y: p.y },
    { x: p.x - 1, y: p.y },
    { x: p.x, y: p.y + 1 },
    { x: p.x, y: p.y - 1 },
    { x: p.x + 1, y: p.y + 1},
    { x: p.x - 1, y: p.y - 1},
    { x: p.x - 1, y: p.y + 1},
    { x: p.x + 1, y: p.y - 1},
  ];
}


function clusterEntry(
  point: Point,
  parent: ClusterEntry | typeof ROOT,
  distance: number = 0
): ClusterEntry {
  return {
    point,
    parent,
    distance,
  }
} 

// Helper to serialize a point for Set
function pointKey(p: Point): string {
  return `${p.x},${p.y}`;
}

