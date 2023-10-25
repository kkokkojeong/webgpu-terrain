
// https://en.wikipedia.org/wiki/Diamond-square_algorithm
// https://github.com/emeiri/ogldev/tree/master/Terrain3

import BasicTerrain from "./BasicTerrain";


// grid to terrain mesh algorithm
class MidpointDispTerrain extends BasicTerrain {
    
    private _roughness: number;

    constructor(w: number, z: number, heightMap: number[] = [], worldScale?: number) {
        super(w, z, heightMap, worldScale);
    }

    public createMidpointDisplacement(roughness: number) {
        this._roughness = roughness;

        this._diamondStep();
        this._squareStep();
    }

    private _diamondStep() {}
    private _squareStep() {}
}

export default MidpointDispTerrain;