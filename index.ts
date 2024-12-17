// INFO: NOTES
//
// We have a value (say a real value) that ranges between -1 and 1,
// and we want to map it to (0, 5).
//
// We can first normalize the value using Scalar.Normalize() with its possible range
// and then use the Lerp function to map it to the desired range.
//
// Example:
// let normalize_angle = Scalar.Normalize(Math.sin(angle), -1, 1);
// let lerped_angle = Scalar.Lerp(1, 2.5, normalize_angle); // Maps sin value to (1, 2.5)

import {
  Engine,
  Scene,
  Vector3,
  MeshBuilder,
  ArcRotateCamera,
  FreeCamera,
  Camera,
  HemisphericLight,
  DirectionalLight,
  Scalar,
  Mesh,
  Vector2,
  Color3,
  StandardMaterial,
} from "@babylonjs/core";

import { GradientMaterial } from "@babylonjs/materials";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true,
  antialias: true,
  useHighPrecisionFloats: true,
});
engine.setHardwareScalingLevel(1); // native
const scene = new Scene(engine);

// const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 4, 20, Vector3.Zero(), scene);
// camera.attachControl(canvas, true);

const camera = new FreeCamera(
  "OrthographicCamera",
  new Vector3(20, 25, 20),
  scene,
);
camera.setTarget(Vector3.Zero()); // Point the camera at the origin
camera.mode = Camera.ORTHOGRAPHIC_CAMERA; // Set the camera mode to orthographic
//
const orthoSize = 20; // Controls the zoom level
camera.orthoLeft = -orthoSize;
camera.orthoRight = orthoSize;
camera.orthoTop = orthoSize;
camera.orthoBottom = -orthoSize;
camera.position.y = 20;

const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
const light1 = new DirectionalLight("light1", new Vector3(-1, 1, 1), scene);
const light2 = new DirectionalLight("light2", new Vector3(-1, -1, 1), scene);
// const light3 = new DirectionalLight("light3", new Vector3(1, -1, -0.5), scene);

let angle = 0.0;
const cuboid_arr: Mesh[] = [];
const initial_height = 8;

const h = 18;
const w = 18;
const spacing = 0.625;
const angle_limiter = 10000;
const grid_center_x = ((w - 1) * spacing) / 2;
const grid_center_y = ((h - 1) * spacing) / 2;
let origin_to_center = new Vector2(grid_center_x, grid_center_y);

// COLORS
const topColor = new Color3(0.96, 0.29, 0.17); // #ff3300
const bottomColor = new Color3(0.85, 0.17, 0.17); // #66ccff

const gradientMaterial = new GradientMaterial("gradientMaterial", scene);
gradientMaterial.topColor = topColor;
gradientMaterial.bottomColor = bottomColor;
gradientMaterial.offset = Math.random();
gradientMaterial.smoothness = 1;

const standardMaterial = new StandardMaterial("standardMaterial", scene);
standardMaterial.diffuseColor = new Color3(1, 0.2, 0); // Default color
// standardMaterial.vertex= true; // Enable vertex colors

for (let i = 0; i < h; i++) {
  for (let j = 0; j < w; j++) {
    let cuboid = MeshBuilder.CreateBox(`box${i}${j}`, {
      size: 2,
      width: 0.5,
      height: initial_height,
      depth: 0.5,
    });
    cuboid.position.x = j * spacing;
    cuboid.position.z = i * spacing;
    // cuboid.material = standardMaterial;
    cuboid.material = gradientMaterial;
    cuboid_arr[i * w + j] = cuboid;
  }
}

// r1, r2 : initial possible range of the value | d1, d2 final mapping destination range
const map_to_scalar = (
  value: number,
  r1: number,
  r2: number,
  d1: number,
  d2: number,
): number => {
  let normalized_value = Scalar.Normalize(value, r1, r2);
  return Scalar.Lerp(d1, d2, normalized_value);
};

const oscillate_cuboid = (angle: number, cuboid_arr: Mesh[]): void => {
  angle %= angle_limiter;
  let offset = 0;
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      let cuboid = cuboid_arr[i * w + j];
      let v = new Vector2(cuboid.position.x, cuboid.position.z);
      const d = Vector2.Distance(v, origin_to_center);
      offset = map_to_scalar(
        d,
        0,
        5 * Math.SQRT2,
        (-Math.PI * 3) / 4,
        (Math.PI * 3) / 4,
      );
      let vheight = map_to_scalar(Math.sin(angle + offset), -1, 1, 0.5, 2.0);
      cuboid.scaling.y = vheight;
    }
  }
};

engine.runRenderLoop(() => {
  angle -= 0.035;
  oscillate_cuboid(angle, cuboid_arr);
  // console.log(angle, cuboid.scaling.y);
  scene.render();
});
window.addEventListener("resize", () => {
  engine.resize();
});
