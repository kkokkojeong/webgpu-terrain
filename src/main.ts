import TerrainDemo from "./terrain-demo";
import heightMap from "../data/heightmap.json";

window.onload = () => {
  const {width, height, data} = heightMap;

  console.log("height map information ", width, height);
  console.log("height map data ", data);

  

  const demo = new TerrainDemo("canvas-webgpu", {width: width, depth: height, heigts: data});
  

  let lastFrameMS = Date.now();

  let animationId;
  const frame = () => {
    const now = Date.now();
    const deltaTime = (now - lastFrameMS) / 1000;
    lastFrameMS = now;

    demo.render(deltaTime);
    animationId = window.requestAnimationFrame(frame);
  }

  window.requestAnimationFrame(frame);
};