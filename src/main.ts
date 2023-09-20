import Terrain from "./terrain";

import heightMap from "../data/heightmap.json";
import BasicTerrain from "./BasicTerrain";

window.onload = () => {
  const {width, height, data} = heightMap;
  console.log("height map information ", width, height);
  console.log("height map data ", data);

  const bt = new BasicTerrain(width, height, data);

  console.log(bt.getTriangleList());

  const terrain = new Terrain("canvas-webgpu");
  terrain.render();
};