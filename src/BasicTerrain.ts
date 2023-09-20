import { Vector3D } from "./Vector";

class TriangleList {

    private _depth: number;         // z-axis
    private _width: number;         // x-axis
    private _data: number[];        // height map array
    private _worldScale: number;    // scale factor to height(y-axis)

    public vertices: Vector3D[];
    public indices: number[];

    constructor(options: {
        width: number;
        depth: number;
        data: number[];
        worldScale: number;
    }) {
        this._width = options.width;
        this._depth = options.depth;
        this._data = options.data;
        this._worldScale = options.worldScale || 1;

        this.vertices = [];
        this.indices = [];
    }

    public createTriangleList() {
        this._makeVertices();
        this._makeIndices();
    }

    private _makeVertices() {
        const getHeight = (x: number, z: number) => {
            return this._data[z * this._width + x];
        }

        const worldScale = this._worldScale;

        for (let z = 0; z < this._depth; z++) {
            for (let x = 0; x < this._width; x++) {
                const vertex = new Vector3D(x * worldScale, getHeight(x, z), z * worldScale);
                this.vertices.push(vertex);
                // console.log(vertex.toString());
            }
        }
    }

    /**
     * 2D Grid 형태로 만들어서 (width, depth) 값에 따라 단순히 height 값을 맵핑
     */
    private _makeIndices() {
        const width = this._width;
        const depth = this._depth;

        for (let z = 0; z < depth - 1; z++) {
            for (let x = 0; x < width - 1; x++) {
                const bottomLeft = z * width + x;
                const topLeft = (z + 1) * width + x;
                const topRight = (z + 1) * width + x + 1;
                const bottomRight = z * width + x + 1;

                //    1---------2
                //    /       /
                //   /       /   -> order top-left [0, 1, 2], bottom-right [0, 2, 3] 
                //  /       /
                // 0--------3

                // add top left triangle
                this.indices.push(bottomLeft);
                this.indices.push(topLeft);
                this.indices.push(topRight);

                // add bottom right triangle
                this.indices.push(bottomLeft);
                this.indices.push(topRight);
                this.indices.push(bottomRight);
            }
        }
    }
}


class BasicTerrain {

    private _width: number;
    private _depth: number;
    private _heightMap: number[];
    private _worldScale: number;

    private _triangleList: TriangleList;

    constructor(w: number, z: number, heightMap: number[], worldScale?: number) {
        this._width = w;
        this._depth = z;
        this._heightMap = heightMap;
        this._worldScale = worldScale || 1;

        this._init();
    }

    private _init() {
        this._triangleList = new TriangleList({
            width: this._width,
            depth: this._depth,
            data: this._heightMap,
            worldScale: this._worldScale
        });
        this._triangleList.createTriangleList();
    }

    public getTriangleList(): TriangleList {
        return this._triangleList;
    }
}

export default BasicTerrain;