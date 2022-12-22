import "./style.css";
import * as three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// scene and camera
const scene = new three.Scene();
const camera = new three.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.setZ(30);
camera.position.setX(-3);

// renderer
const renderer = new three.WebGL1Renderer({
  canvas: document.querySelector("#bg"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.render(scene, camera);

// torus
const geometry = new three.TorusGeometry(10, 3, 16.1);
const material = new three.MeshStandardMaterial({
  color: 0xff6347,
});
const torus = new three.Mesh(geometry, material);

//scene.add(torus);

// lights
const pointLight = new three.PointLight(0xffffff);
pointLight.position.set(5,5,5);
scene.add(pointLight);

const ambientLight = new three.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// helpers
const lightHelper = new three.PointLightHelper(pointLight);
const gridHelper = new three.GridHelper(200, 50);
//scene.add(lightHelper, gridHelper);

// controls
// const controls = new OrbitControls(camera, renderer.domElement);

//stars
function addStar() {
  const geometry = new three.SphereGeometry(0.25, 24, 24);
  const material = new three.MeshStandardMaterial({ color: 0xffffff });
  const star = new three.Mesh(geometry, material);
  const [x, y, z] = Array(3)
    .fill()
    .map(() => three.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);

// background
const spaceTexture = new three.TextureLoader().load("space.jpg");
scene.background = spaceTexture;

// Avatar
const pawTexture = new three.TextureLoader().load('paw.png');
const paw = new three.Mesh(new three.BoxGeometry(3, 3, 3), new three.MeshBasicMaterial({ map: pawTexture }));
paw.position.z = -1
paw.position.x =2

scene.add(paw);

// moon
const moonTexture = new three.TextureLoader().load("moon.jpg");
const moonNormals = new three.TextureLoader().load("normal.jpg");
const moon = new three.Mesh(
  new three.SphereGeometry(3, 32, 32),
  new three.MeshStandardMaterial({ map: moonTexture, normalMap: moonNormals })
);
moon.position.z = 30;
moon.position.setX(-10);

scene.add(moon);

// page scroll animation
function moveCamera() {
  const t = document.body.getBoundingClientRect().top; // current scroll position

  moon.rotation.x += 0.05;
  moon.rotation.y += 0.075;
  moon.rotation.z += 0.05;

  paw.rotation.y += 0.01
  paw.rotation.z += 0.01

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.position.y = t * -0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();

// render update
function animate() {
  requestAnimationFrame(animate);

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;

  moon.rotation.x += 0.005;
  // controls.update();
  renderer.render(scene, camera);
}

animate();
