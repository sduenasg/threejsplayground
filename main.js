import "./style.css";
import * as THREE from "THREE";
import { OrbitControls } from "THREE/examples/jsm/controls/OrbitControls";

// scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.setZ(30);
camera.position.setX(-3);

// renderer
const renderer = new THREE.WebGL1Renderer({
  canvas: document.querySelector("#bg"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.render(scene, camera);

// torus
const geometry = new THREE.TorusGeometry(10, 3, 16.1);
const material = new THREE.MeshStandardMaterial({
  color: 0xff6347,
});
const torus = new THREE.Mesh(geometry, material);

//scene.add(torus);

// lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5,5,5);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// helpers
const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
//scene.add(lightHelper, gridHelper);

// controls
// const controls = new OrbitControls(camera, renderer.domElement);

//stars
const starGeometry = new THREE.SphereGeometry(0.05, 24, 24);
const starMaterial = new THREE.MeshStandardMaterial({ color: 0xf7ebda });

function addStar() {
  const star = new THREE.Mesh(starGeometry, starMaterial);
  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);

// background
const spaceTexture = new THREE.TextureLoader().load("space.jpg");
scene.background = spaceTexture;

// Avatar
const cubeTexture = new THREE.TextureLoader().load('kona.jpeg');
const cube = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshBasicMaterial({ map: cubeTexture }));
cube.position.z = -5
cube.position.x = 2

scene.add(cube);

// moon
const moonTexture = new THREE.TextureLoader().load("moon.jpg");
const moonNormals = new THREE.TextureLoader().load("normal.jpg");
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({ map: moonTexture, normalMap: moonNormals })
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

  cube.rotation.y += 0.01
  cube.rotation.z += 0.01

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
