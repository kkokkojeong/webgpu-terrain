import Terrain from "./terrain";

window.onload = () => {
  console.log("start");
  const terrain = new Terrain("canvas-webgpu");
  terrain.render();
};