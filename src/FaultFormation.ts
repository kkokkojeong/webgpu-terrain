
// https://en.wikipedia.org/wiki/Fault_block
// https://github.com/emeiri/ogldev/tree/master/Terrain2

import BasicTerrain, { TriangleList } from "./BasicTerrain";
import { Point2D } from "./math/Vector";

// grid to terrain mesh algorithm
class FaultFormationTerrain extends BasicTerrain {

    private _minHeight: number;
    private _maxHeight: number;
    private _iterations: number;
    
    constructor(w: number, z: number, heightMap: number[] = [], worldScale?: number) {
        super(w, z, heightMap, worldScale);
    }

    public createFaultFormation(iterations: number, minHeight: number, maxHeight: number) {
        this._maxHeight = maxHeight;
        this._minHeight = minHeight;
        this._iterations = iterations;

        this._resetHeightMap();

        this._makeFaultFormation();
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
                        this._heightMap[z * this._width + x] += height 
                    }
                }
            }
        }
    }

    private _resetHeightMap() {
        const len = this._width * this._depth;
        for (let i = 0; i < len; i++) {
            this._heightMap[i] = 0;
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
}

export default FaultFormationTerrain;