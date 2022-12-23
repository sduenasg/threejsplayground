import "../style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";

const airplaneUrl = new URL("../assets/airplane.glb", import.meta.url);
const catUrl = new URL("../assets/cat.glb", import.meta.url);
const clock = new THREE.Clock();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
);

camera.position.setZ(30);
camera.position.setX(-3);

// renderer
const renderer = new THREE.WebGL1Renderer({
  canvas: document.querySelector("#bg"),
  antialias: true,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(sizes.width, sizes.height);

renderer.render(scene, camera);
//renderer.physicallyCorrectLights = true;
// torus
const geometry = new THREE.TorusGeometry(10, 3, 16.1);
const material = new THREE.MeshStandardMaterial({
  color: 0xff6347,
});
const torus = new THREE.Mesh(geometry, material);

//scene.add(torus);

// lights
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(-15, 15, 30);

const ambientLight = new THREE.AmbientLight(0x222222);
scene.add(pointLight, ambientLight);

// helpers
const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
const axesHelper = new THREE.AxesHelper(5);
//scene.add(lightHelper, gridHelper);

// controls
// const controls = new OrbitControls(camera, renderer.domElement);

//stars
const starGeometry = new THREE.SphereGeometry(0.05, 24, 24);
const starMaterial = new THREE.MeshBasicMaterial({ color: 0xf7ebda });

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
const spaceTexture = new THREE.TextureLoader().load("./assets/space.jpg");
scene.background = spaceTexture;

// cube
const cubeTexture = new THREE.TextureLoader().load("./assets/kona.jpeg");
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(3, 3, 3),
  new THREE.MeshStandardMaterial({ map: cubeTexture })
);
cube.position.z = -5;
cube.position.x = 2;

scene.add(cube);

// moon
const moonTexture = new THREE.TextureLoader().load("./assets/moon.jpg");
const moonNormals = new THREE.TextureLoader().load("./assets/normal.jpg");
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 64, 64),
  new THREE.MeshStandardMaterial({ map: moonTexture, normalMap: moonNormals })
);
moon.position.z = 30;
moon.position.setX(-10);

scene.add(moon);

// blender model

const assetLoader = new GLTFLoader();
assetLoader.load(
  airplaneUrl.href,
  function (gltf) {
    const airplane = gltf.scene;
    airplane.scale.x = 0.1;
    airplane.scale.y = 0.1;
    airplane.scale.z = 0.1;

    airplane.position.z = 18;
    airplane.position.x = -20;

    scene.add(airplane);
    airplane.rotateY(-Math.PI / 1.8);
    airplane.rotateX(-Math.PI / 12);

    gltf.animations.forEach((animation) => {
      console.log(animation.name);
    });
  },
  undefined,
  function (error) {
    alert("Error loading airplane model " + error);
  }
);

let catmixer = new THREE.AnimationMixer();

assetLoader.load(
  catUrl.href,
  function (gltf) {
    const catmodel = gltf.scene;

    catmodel.position.z = 25;
    catmodel.position.x = -24;
    catmodel.position.y = -3;
    scene.add(catmodel);

    catmodel.rotateY(Math.PI / 3);

    //gltf.animations.forEach((animation, index) => {
    //  console.log(index + " " + animation.name);
    //});

    catmixer = new THREE.AnimationMixer(gltf.scene);

    // Get an AnimationAction for a specific animation
    const action = catmixer.clipAction(gltf.animations[8]);

    // Set the loop property to THREE.LoopRepeat
    action.setLoop(THREE.LoopRepeat);
  
    // Start playing the animation
    action.play();
  },
  undefined,
  function (error) {
    alert("Error loading cat model " + error);
  }
);

let nextCameraPosition = new THREE.Vector3(-3, 0, 30);
// page scroll animation
function moveCamera() {
  const lerp = function (a, b, c) {
    return a + c * (b - a);
  };

  const t = document.body.getBoundingClientRect().top; // current scroll position
  moon.rotation.y += 0.075;

  cube.rotation.y += 0.01;
  cube.rotation.z += 0.01;

  var h = document.documentElement,
    b = document.body,
    st = "scrollTop",
    sh = "scrollHeight";

  const scrollPercent = (h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight);

  // next camera position to lerp to
  nextCameraPosition.z = t * -0.01;
  nextCameraPosition.y = t * -0.0002;
  nextCameraPosition.x = lerp(-3, moon.position.x - 8, scrollPercent);

}

document.body.onscroll = moveCamera;
moveCamera();

// render update
function animate() {

  const cameraPosition = camera.position.lerp(nextCameraPosition, 0.1)
  camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)

  cube.rotation.y += 0.003;
  cube.rotation.z += 0.003;

  moon.rotation.y += 0.005;

  // controls.update();
  renderer.render(scene, camera);


  catmixer.update(clock.getDelta());
  requestAnimationFrame(animate);
}

window.addEventListener("resize", () => {
  // update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

animate();
