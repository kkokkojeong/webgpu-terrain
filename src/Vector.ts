export class Vector2D {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class Vector3D extends Vector2D {
    public z: number;

    constructor(x: number, y: number, z: number) {
        super(x, y);

        this.z = z;
    }

    public toString(): string {
        return `(x: ${this.x}, y: ${this.y}, z: ${this.z})`;
    }
}