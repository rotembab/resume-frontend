const TAU = Math.PI * 2;
const MAX_PITCH = 1.1;

/** The orientation the globe starts at; the share image freezes this frame. */
export const GLOBE_START = { yaw: 0.6, pitch: -0.28 };

export type Point = { x: number; y: number; z: number };

/** Evenly spreads n points over a unit sphere (Fibonacci lattice). */
export const spherePoints = (count: number): Point[] => {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, index) => {
    const y = count === 1 ? 0 : 1 - (index / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * index;
    return { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius };
  });
};

/** Rotates a point by yaw (around Y) then pitch (around X). */
export const rotate = (point: Point, yaw: number, pitch: number): Point => {
  const x1 = point.x * Math.cos(yaw) + point.z * Math.sin(yaw);
  const z1 = -point.x * Math.sin(yaw) + point.z * Math.cos(yaw);
  return {
    x: x1,
    y: point.y * Math.cos(pitch) - z1 * Math.sin(pitch),
    z: point.y * Math.sin(pitch) + z1 * Math.cos(pitch),
  };
};

/** The yaw and pitch that bring a point to the front, facing the viewer. */
export const facing = (point: Point) => {
  const yaw = Math.atan2(-point.x, point.z);
  const depth = Math.hypot(point.x, point.z);
  return { yaw, pitch: Math.atan2(point.y, depth) };
};

export const nearestAngle = (from: number, to: number) => {
  const delta = ((((to - from) % TAU) + TAU * 1.5) % TAU) - Math.PI;
  return from + delta;
};

export const clampPitch = (pitch: number) =>
  Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch));
