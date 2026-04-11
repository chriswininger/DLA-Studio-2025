export interface Point3D {
  x: number;
  y: number;
  z: number;
}

const ROOT = "ROOT" as const;

export const ORIGIN_KEY = "0.0000,0.0000,0.0000";

export interface ClusterEntry3D {
  point: Point3D;
  distance: number;
  parent: ClusterEntry3D | typeof ROOT;
  parentPoint: Point3D | null;
}

export interface ClusterMap3D {
  [key: string]: ClusterEntry3D;
}

export interface DLA3DState {
  cluster: ClusterMap3D;
  walkers: Point3D[];
  steps: number;
  stepSize: number;
  stickDistance: number;
  boundHalfExtent: number;
  centerSticky: boolean;
  floorSticky: boolean;
}

export function createDLA3DState(
  boundHalfExtent: number,
  stickDistance: number,
  centerSticky: boolean = true,
  floorSticky: boolean = false,
): DLA3DState {
  const cluster: ClusterMap3D = {};

  if (centerSticky) {
    const origin: Point3D = { x: 0, y: 0, z: 0 };
    cluster[pointKey(origin)] = {
      point: origin,
      distance: 0,
      parent: ROOT,
      parentPoint: null,
    };
  }

  return {
    cluster,
    walkers: [],
    steps: 0,
    stepSize: 0.2,
    stickDistance,
    boundHalfExtent,
    centerSticky,
    floorSticky,
  };
}

export function stepDLA3D(state: DLA3DState): DLA3DState {
  const { cluster, stepSize, stickDistance, boundHalfExtent, floorSticky } =
    state;
  const newCluster: ClusterMap3D = {};
  const newWalkers: Point3D[] = [];
  const stickDistSq = stickDistance * stickDistance;
  const floorY = -boundHalfExtent;

  const clusterPoints = Object.values(cluster);

  for (const walker of state.walkers) {
    const dx = (Math.random() - 0.5) * 2 * stepSize;
    const dy = (Math.random() - 0.5) * 2 * stepSize;
    const dz = (Math.random() - 0.5) * 2 * stepSize;

    const moved: Point3D = {
      x: clamp(walker.x + dx, -boundHalfExtent, boundHalfExtent),
      y: clamp(walker.y + dy, -boundHalfExtent, boundHalfExtent),
      z: clamp(walker.z + dz, -boundHalfExtent, boundHalfExtent),
    };

    if (floorSticky && moved.y <= floorY) {
      const key = pointKey(moved);
      if (!cluster[key] && !newCluster[key]) {
        newCluster[key] = {
          point: moved,
          distance: 0,
          parent: ROOT,
          parentPoint: null,
        };
      }
      continue;
    }

    let stuckParent: ClusterEntry3D | undefined;
    for (const entry of clusterPoints) {
      const ex = moved.x - entry.point.x;
      const ey = moved.y - entry.point.y;
      const ez = moved.z - entry.point.z;
      if (ex * ex + ey * ey + ez * ez < stickDistSq) {
        stuckParent = entry;
        break;
      }
    }

    if (stuckParent) {
      const key = pointKey(moved);
      if (!cluster[key] && !newCluster[key]) {
        newCluster[key] = {
          point: moved,
          distance: stuckParent.distance + 1,
          parent: stuckParent,
          parentPoint: stuckParent.point,
        };
      }
    } else {
      newWalkers.push(moved);
    }
  }

  return {
    ...state,
    cluster: { ...cluster, ...newCluster },
    walkers: newWalkers,
    steps: state.steps + 1,
  };
}

function pointKey(p: Point3D): string {
  return `${p.x.toFixed(4)},${p.y.toFixed(4)},${p.z.toFixed(4)}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
