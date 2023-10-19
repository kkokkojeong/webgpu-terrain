import { Mat4, Vec3, mat4, vec3 } from 'wgpu-matrix';

// https://github.com/webgpu/webgpu-samples/blob/main/src/sample/cameras/camera.ts
class Camera {
    private _matrix = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);

    private _view = mat4.create();

    private _right = new Float32Array(this._matrix.buffer, 4 * 0, 4);
    private _up = new Float32Array(this._matrix.buffer, 4 * 4, 4);
    private _back = new Float32Array(this._matrix.buffer, 4 * 8, 4);
    private _position = new Float32Array(this._matrix.buffer, 4 * 12, 4);

    get matrix() {
        return this._matrix
    }
    set matrix(mat: Mat4) {
        mat4.copy(mat, this._matrix);
    }

    get view() {
        return this._view;
    }
    set view(mat: Mat4) {
        mat4.copy(mat, this._view);
    }

    get right() {
        return this._right;
    }
    set right(vec: Vec3) {
        vec3.copy(vec, this._right);
    }

    get up() {
        return this._up;
    }
    set up(vec: Vec3) {
        vec3.copy(vec, this._up);
    }

    get back() {
        return this._back;
    }
    set back(vec: Vec3) {
        vec3.copy(vec, this._back);
    }

    get position() {
        return this._position;
    }
    set position(vec: Vec3) {
        vec3.copy(vec, this._position);
    }
}

export default Camera;