
// https://en.wikipedia.org/wiki/Diamond-square_algorithm
// https://github.com/emeiri/ogldev/tree/master/Terrain3

import BasicTerrain, { TriangleList } from "./BasicTerrain";
import { nearestPowerOfTwo, randomFloatRange } from "./utils/math";


// grid to terrain mesh algorithm
class MidpointDispTerrain extends BasicTerrain {
    
    private _roughness: number;
    private _minHeight: number;
    private _maxHeight: number;

    constructor(w: number, z: number, heightMap: number[] = [], worldScale?: number) {
        super(w, z, heightMap, worldScale);
    }

    public createMidpointDisplacement(roughness: number, minHeight: number, maxHeight: number) {
        this._roughness = roughness;
        this._minHeight = minHeight;
        this._maxHeight = maxHeight;

        this._resetHeightMap();

        this._makeMidpointDisplacement();

        this._normalizeHeightMap();

        this._triangleList = new TriangleList({
            width: this._width,
            depth: this._depth,
            data: this._heightMap,
            worldScale: this._worldScale
        });
        this._triangleList.createTriangleList();
    }

    private _makeMidpointDisplacement() {
        // width, depth 가 같은 정사각형 grid 형태라고 가정
        const terrainSize = this._width;
        const roughness = this._roughness;

        let rectSize = nearestPowerOfTwo(terrainSize);
        let currHeight = rectSize / 2;
        let heightReduce = Math.pow(2, -roughness);

        console.log(terrainSize, rectSize);

        while (rectSize > 0) {
            this._diamondStep(rectSize, currHeight);
            this._squareStep(rectSize, currHeight);

            rectSize = Math.floor(rectSize / 2);
            currHeight *= heightReduce;

            console.log(rectSize, currHeight);
        }
    }

    private _diamondStep(rectSize: number, currHeight: number) {
        const halfRectSize = Math.floor(rectSize / 2);
        const terrainSize = this._width;
        
        for (let y = 0; y < terrainSize; y += rectSize) {
            for (let x = 0; x < terrainSize ; x += rectSize) {
                let nextX = (x + rectSize) % terrainSize;
                let nextY = (y + rectSize) % terrainSize;

                if (nextX < x) {
                    nextX = terrainSize - 1;
                }

                if (nextY < y) {
                    nextY = terrainSize - 1;
                }

                const topLeft = this.getHeight(x, y);
                const topRight = this.getHeight(nextX, y);
                const bottomLeft = this.getHeight(x, nextY);
                const bottomRight = this.getHeight(nextX, nextY);

                const midX = (x + halfRectSize) % terrainSize;
                const midY = (y + halfRectSize) % terrainSize;

                const randValue = randomFloatRange(currHeight, -currHeight);
                const midPoint = (topLeft + topRight + bottomLeft + bottomRight) / 4.0;

                this.setHeight(midX, midY, midPoint + randValue);
            }
        }
    }

     /*                ----------------------------------
                      |                                |
                      |           PrevYCenter          |
                      |                                |
                      |                                |
                      |                                |
     ------------------CurTopLeft..CurTopMid..CurTopRight
                      |                                |
                      |                                |
       CurPrevXCenter CurLeftMid   CurCenter           |
                      |                                |
                      |                                |
                      CurBotLeft------------------------

       CurTopMid = avg(PrevYCenter, CurTopLeft, CurTopRight, CurCenter)
       CurLeftMid = avg(CurPrevXCenterm CurTopleft, CurBotLeft, CurCenter)
    */
    private _squareStep(rectSize: number, currHeight: number) {
        const halfRectSize = Math.floor(rectSize / 2);
        const terrainSize = this._width;

        console.log(halfRectSize)

        for (let y = 0; y < terrainSize; y += rectSize) {
            for (let x = 0; x < terrainSize; x += rectSize) {
                let nextX = (x + rectSize) % terrainSize;
                let nextY = (y + rectSize) % terrainSize;

                if (nextX < x) {
                    nextX = terrainSize - 1;
                }
                if (nextY < y) {
                    nextY = terrainSize - 1;
                }

                const midX = (x + halfRectSize) % terrainSize;
                const midY = (y + halfRectSize) % terrainSize;

                const prevMidX = (x - halfRectSize + terrainSize) % terrainSize;
                const prevMidY = (y - halfRectSize + terrainSize) % terrainSize;

                const curTopLeft = this.getHeight(x, y);
                const curTopRight = this.getHeight(nextX, y);
                const curCenter = this.getHeight(midX, midY);
                const prevYCenter = this.getHeight(midX, prevMidY);
                const curBotLeft = this.getHeight(x, nextY);
                const prevXCenter = this.getHeight(prevMidX, midY);

                const randValue1 = randomFloatRange(-currHeight, currHeight);
                const randValue2 = randomFloatRange(-currHeight, currHeight);

                const curLeftMid = (curTopLeft + curCenter + curBotLeft + prevXCenter) / 4.0 + randValue1;
                const curTopMid  = (curTopLeft + curCenter + curTopRight + prevYCenter) / 4.0 + randValue2;

                this.setHeight(midX, y, curTopMid);
                this.setHeight(x, midY, curLeftMid);
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

        console.log(this._heightMap);
    }
}

export default MidpointDispTerrain;