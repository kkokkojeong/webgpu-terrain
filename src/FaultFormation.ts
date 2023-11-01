
// https://en.wikipedia.org/wiki/Fault_block
// https://github.com/emeiri/ogldev/tree/master/Terrain2

import BasicTerrain, { TriangleList } from "./BasicTerrain";
import { Point2D } from "./math/Vector";

// grid to terrain mesh algorithm
class FaultFormationTerrain extends BasicTerrain {

    private _minHeight: number;
    private _maxHeight: number;
    private _iterations: number;
    private _filter: number;
    
    constructor(w: number, z: number, heightMap: number[] = [], worldScale?: number) {
        super(w, z, heightMap, worldScale);
    }

    public createFaultFormation(iterations: number, minHeight: number, maxHeight: number, filter: number) {
        this._maxHeight = maxHeight;
        this._minHeight = minHeight;
        this._iterations = iterations;
        this._filter = filter;

        this._resetHeightMap();

        this._makeFaultFormation();

        // https://en.wikipedia.org/wiki/Finite_impulse_response
        this._applyFIRFilter();

        this._normalizeHeightMap();

        this._triangleList = new TriangleList({
            width: this._width,
            depth: this._depth,
            data: this._heightMap,
            worldScale: this._worldScale
        });
        this._triangleList.createTriangleList();
    }

    private _makeFaultFormation() {
        const minHeight = this._minHeight;
        const maxHeight = this._maxHeight;
        const iterations = this._iterations;
        const deltaHeight = maxHeight - minHeight;

        for (let iter = 0; iter < iterations; iter++) {
            const iterationRatio = iter / iterations;
            const height = maxHeight - deltaHeight * iterationRatio;

            const { p1, p2 } = this._getRandomTerrainPoints();

            const dirX = p2.x - p1.x;
            const dirZ = p2.y - p1.y;

            for (let z = 0; z < this._depth; z++) {
                for (let x = 0; x < this._width; x++) {
                    const dirXin = x - p1.x;
                    const dirZin = z - p1.y;

                    // cross product
                    const cp = dirXin * dirZ - dirX * dirZin;
                    if (cp > 0) {
                        // accumulate height map`s value
                        const curr = this._heightMap[z * this._width + x];
                        this._heightMap[z * this._width + x] = curr + height 
                    }
                }
            }
        }
    }

    private _normalizeHeightMap() {
        const heights = this._heightMap;
        const min = Math.min(...heights);
        const max = Math.max(...heights);

        const delta = max - min;
        const deltaRange = this._maxHeight - this._minHeight;
        const len = this._width * this._depth;

        for (let i = 0; i < len; i++) {
            const h = this._heightMap[i];
            this._heightMap[i] = (h - min) / delta * deltaRange + this._minHeight;
        }
    }

    private _getRandomTerrainPoints() {
        const x1 = Math.floor(Math.random() * this._width);
        const z1 =  Math.floor(Math.random() * this._depth);

        const p1 = new Point2D(x1, z1);

        let count = 0;

        let x2 = Math.floor(Math.random() * this._width);
        let z2 = Math.floor(Math.random() * this._depth);
        
        let p2 = new Point2D(x2, z2);

        while (p1.equals(p2)) {
            x2 = Math.floor(Math.random() * this._width);
            z2 = Math.floor(Math.random() * this._depth);
            p2 = new Point2D(x2, z2);

            count++;
            if (count > 10000) {
                console.error("endless loop _getRandomTerrainPoints");
                break;
            }
        }

        return {p1, p2};
    }

    private _applyFIRFilter() {
        const getIdx = (x: number, z: number) => z * this._width + x;
        const getHeight = (x: number, z: number) => this._heightMap[getIdx(x, z)];
        const filterFIR = (x: number, z: number, val: number) => {
            const filter = this._filter;

            const idx = getIdx(x, z);
            const curr = getHeight(x, z);

            const acc = filter * val + (1 - filter) * curr;

            this._heightMap[idx] = acc;

            return acc;
        }
        
        const heights = this._heightMap;


        let prev = 0;

        // left to right
        for (let z = 0; z < this._depth; z++) {
            prev = getHeight(0, z);
            for (let x = 1; x < this._width; x++) {
                prev = filterFIR(x, z, prev);
            }
        }

        // right to left
        for (let z = 0; z < this._depth; z++) {
            prev = getHeight(this._width - 1, z);
            for (let x = this._width - 2; x >= 0; x--) {
                prev = filterFIR(x, z, prev);
            }
        }

        // bottom to top
        for (let x = 0; x < this._width; x++) {
            prev = getHeight(x, 0);
            for (let z = 1; z < this._depth; z++) {
                prev = filterFIR(x, z, prev);
            }
        }
        

        // top to bottom
        for (let x = 0; x < this._width; x++) {
            prev = getHeight(x, this._depth - 1);
            for (let z = this._depth - 2; z >= 0; z--) {
                prev = filterFIR(x, z, prev);
            }
        }

    }
}

export default FaultFormationTerrain;