import { Vec3, vec3, Mat4, mat4 } from "wgpu-matrix";
import Camera from "./Camera";
import { extend } from "../utils/util";
import { rotate } from "../utils/math";

// https://github.com/webgpu/webgpu-samples/blob/main/src/sample/cameras/camera.ts

type ArcballCameraOptions = {
    position?: Vec3;
    target?: Vec3;
}

const defaultOptions = {
    position: vec3.create(0, 0, -5),
    target: vec3.create(0, 0, 0)
}

class ArcballCamera extends Camera {

    // The camera distance from the target
    private _distance = 0;

    // The current angular velocity
    private _angularVelocity = 0;

    // The current rotation axis
    private _axis = vec3.create();

    private readonly rotationSpeed = 1; // Speed multiplier for camera rotation
    private readonly zoomSpeed = 0.1;   // Speed multiplier for camera zoom

    // Rotation velocity drag coeffient [0 .. 1]
    // 0: Spins forever
    // 1: Instantly stops spinning
    private readonly frictionCoefficient = 0.999;;

    get axis() {
        return this._axis;
    }
    set axis(vec: Vec3) {
        vec3.copy(vec, this._axis);
    }

    get distance() {
        return this._distance;
    }
    set distance(dst: number) {
        this._distance = dst;
    }

    get matrix() {
        return super.matrix;
    }
    set matrix(mat: Mat4) {
        super.matrix = mat;
        this.distance = vec3.len(this.position);
    }

    constructor(options?: ArcballCameraOptions) {
        super();

        const opts = extend({}, defaultOptions, options);

        this.position = opts.position;
        this.distance = vec3.len(this.position);
        this.back = vec3.normalize(this.position);

        this._recalcuateRight()
        this._recalcuateUp();
    }

    public update(deltaTime: number, input: any): Mat4 {
        const epsilon = 0.0000001;

        console.log(input);

        if (input.analog.touching) {
            // Currently being dragged.
            this._angularVelocity = 0;
        } else {
            // Dampen any existing angular velocity
            this._angularVelocity *= Math.pow(1 - this.frictionCoefficient, deltaTime);
        }

        // Calculate the movement vector
        const movement = vec3.create();
        vec3.addScaled(movement, this.right, input.analog.x, movement);
        vec3.addScaled(movement, this.up, -input.analog.y, movement);

        // Cross the movement vector with the view direction to calculate the rotation axis x magnitude
        const crossProduct = vec3.cross(movement, this.back);

        // Calculate the magnitude of the drag
        const magnitude = vec3.len(crossProduct);

        if (magnitude > epsilon) {
            // Normalize the crossProduct to get the rotation axis
            this.axis = vec3.scale(crossProduct, 1 / magnitude);

            // Remember the current angular velocity. This is used when the touch is released for a fling.
            this._angularVelocity = magnitude * this.rotationSpeed;
        }

        // The rotation around this.axis to apply to the camera matrix this update
        const rotationAngle = this._angularVelocity * deltaTime;
        if (rotationAngle > epsilon) {
            // Rotate the matrix around axis
            // Note: The rotation is not done as a matrix-matrix multiply as the repeated multiplications
            // will quickly introduce substantial error into the matrix.
            this.back = vec3.normalize(rotate(this.back, this.axis, rotationAngle));
            this._recalcuateRight();
            this._recalcuateUp();
        }

        // recalculate `this.position` from `this.back` considering zoom
        if (input.analog.zoom !== 0) {
            this.distance *= 1 + input.analog.zoom * this.zoomSpeed;
        }
        
        this.position = vec3.scale(this.back, this.distance);

        // Invert the camera matrix to build the view matrix
        this.view = mat4.invert(this.matrix);

        return this.view;
    }

    private _recalcuateRight() {
        this.right = vec3.normalize(vec3.cross(this.up, this.back));
    }

    private _recalcuateUp() {
        this.up = vec3.normalize(vec3.cross(this.back, this.right));
    }
}

export default ArcballCamera;