export class Point2D {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public equals(p: Point2D) {
        return p.x === this.x && p.y === this.y;
    }
}

export class Point3D extends Point2D {
    public z: number;

    constructor(x: number, y: number, z: number) {
        super(x, y);

        this.z = z;
    }

    public toString(): string {
        return `(x: ${this.x}, y: ${this.y}, z: ${this.z})`;
    }
}

export class Vector2D extends Point2D {
    constructor(x: number, y: number) {
        super(x, y);
    }
}

export class Vector3D extends Point3D {
    constructor(x: number, y: number, z: number) {
        super(x, y, z);
    }
}

