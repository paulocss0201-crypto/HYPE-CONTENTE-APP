export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GuideLine {
  points: number[];
  orientation: "v" | "h";
}

const THRESHOLD = 8;

export function computeSnap(moving: Box, others: Box[], stageWidth: number, stageHeight: number): { dx: number; dy: number; guides: GuideLine[] } {
  const guides: GuideLine[] = [];
  let dx = 0;
  let dy = 0;

  const movingCx = moving.x + moving.width / 2;
  const movingCy = moving.y + moving.height / 2;
  const movingRight = moving.x + moving.width;
  const movingBottom = moving.y + moving.height;

  const vTargets = [stageWidth / 2, ...others.flatMap((o) => [o.x, o.x + o.width / 2, o.x + o.width])];
  const hTargets = [stageHeight / 2, ...others.flatMap((o) => [o.y, o.y + o.height / 2, o.y + o.height])];

  let bestVDist = THRESHOLD;
  let bestVLine: number | null = null;
  for (const t of vTargets) {
    for (const point of [moving.x, movingCx, movingRight]) {
      const d = Math.abs(point - t);
      if (d < bestVDist) {
        bestVDist = d;
        dx = t - point;
        bestVLine = t;
      }
    }
  }

  let bestHDist = THRESHOLD;
  let bestHLine: number | null = null;
  for (const t of hTargets) {
    for (const point of [moving.y, movingCy, movingBottom]) {
      const d = Math.abs(point - t);
      if (d < bestHDist) {
        bestHDist = d;
        dy = t - point;
        bestHLine = t;
      }
    }
  }

  if (bestVLine !== null) guides.push({ orientation: "v", points: [bestVLine, 0, bestVLine, stageHeight] });
  if (bestHLine !== null) guides.push({ orientation: "h", points: [0, bestHLine, stageWidth, bestHLine] });

  return { dx, dy, guides };
}
