import { Vec3, vec3, mat4 } from "wgpu-matrix";

// Returns `x` clamped between [`min` .. `max`]
export function clamp(x: number, min: number, max: number): number {
    return Math.min(Math.max(x, min), max);
}
  
// Returns `x` float-modulo `div`
export function mod(x: number, div: number): number {
    return x - Math.floor(Math.abs(x) / div) * div * Math.sign(x);
}
  
// Returns `vec` rotated `angle` radians around `axis`
export function rotate(vec: Vec3, axis: Vec3, angle: number): Vec3 {
    return vec3.transformMat4Upper3x3(vec, mat4.rotation(axis, angle));
}
  
// Returns the linear interpolation between 'a' and 'b' using 's'
export function lerp(a: Vec3, b: Vec3, s: number): Vec3 {
    return vec3.addScaled(a, vec3.sub(b, a), s);
}