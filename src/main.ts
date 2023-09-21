import TerrainDemo from "./terrain-demo";
import heightMap from "../data/heightmap.json";

window.onload = () => {
  const {width, height, data} = heightMap;

  console.log("height map information ", width, height);
  console.log("height map data ", data);

  

  const demo = new TerrainDemo("canvas-webgpu", {width: width, depth: height, heigts: data});
  
  // let animationId;
  // const animate = () => {
  //   console.log("animate!!");
  //   demo.render();
  //   animationId = window.requestAnimationFrame(animate);
  // }
  // animate();
  
  demo.render();
};