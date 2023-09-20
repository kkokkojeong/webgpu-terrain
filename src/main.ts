import Terrain from "./terrain";

import heightMap from "../data/heightmap.json";

window.onload = () => {
  const {width, height, data} = heightMap;
  console.log("height map information ", width, height);
  console.log("height map data ", data);

  const terrain = new Terrain("canvas-webgpu");
  terrain.render();
};