import "../style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";

const airplaneUrl = new URL("../assets/airplane.glb", import.meta.url);
const catUrl = new URL("../assets/cat.glb", import.meta.url);
const cerditoUrl = new URL("../assets/cerdito.glb", import.meta.url);


const clock = new THREE.Clock();
let mixers = [];

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
pointLight.position.set(-15, 15, 50);

const ambientLight = new THREE.AmbientLight(0x232e63);
scene.add(pointLight, ambientLight);

// helpers
const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
const axesHelper = new THREE.AxesHelper(5);
//scene.add(lightHelper, gridHelper);

// controls
// const controls = new OrbitControls(camera, renderer.domElement);

//stars
const starGeometry = new THREE.SphereGeometry(0.05, 16, 16);
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
moon.position.z = 35;
moon.position.setX(-10);

scene.add(moon);

// blender model

const assetLoader = new GLTFLoader();

let airplane = new THREE.Mesh();
assetLoader.load(
  airplaneUrl.href,
  function (gltf) {
    airplane = gltf.scene;

    airplane.scale.set(0.1, 0.1, 0.1);
    airplane.position.set(-20, 0, 18);

    scene.add(airplane);
    airplane.rotateY(-Math.PI / 1.8);
    airplane.rotateX(-Math.PI / 12);

    const mixer = new THREE.AnimationMixer(gltf.scene);
    mixers.push(mixer);

    gltf.animations.forEach((animation, index) => {
      console.log(index + " " + animation.name);
    });

    const propeller = mixer.clipAction(gltf.animations[2]);
    propeller.setLoop(THREE.LoopRepeat);
    propeller.timeScale = 5;
    propeller.play();

    const flying = mixer.clipAction(gltf.animations[1]);
    flying.setLoop(THREE.LoopRepeat);
    flying.play();
  },
  undefined,
  function (error) {
    alert("Error loading airplane model " + error);
  }
);



let catmodel = new THREE.Mesh();
assetLoader.load(
  catUrl.href,
  function (gltf) {
    catmodel = gltf.scene;

    catmodel.position.set(-24, -3, 25);
    

    catmodel.rotateY(Math.PI / 3);

    //gltf.animations.forEach((animation, index) => {
    //  console.log(index + " " + animation.name);
    //});

    const catmixer = new THREE.AnimationMixer(gltf.scene);
    mixers.push(catmixer);

    // Get an AnimationAction for a specific animation
    const action = catmixer.clipAction(gltf.animations[11]);

    // Set the loop property to THREE.LoopRepeat
    action.setLoop(THREE.LoopRepeat);

    // Start playing the animation
    action.play();

    scene.add(catmodel);
  },
  undefined,
  function (error) {
    alert("Error loading cat model " + error);
  }
);

let cerdito = new THREE.Mesh();
assetLoader.load(
  cerditoUrl.href,
  function (gltf) {
    cerdito = gltf.scene;
    cerdito.position.set(0, -3, 12);
    cerdito.rotateY(Math.PI/1.01);
    scene.add(cerdito);
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

let step = 0
const speed = 0.05

function mainLoop() {
  step += speed;

  animateCamera()
  const distanceToCameraTarget = camera.position.distanceTo(nextCameraPosition)

  animateCamera()
  animateAirplane()
  animatePig()
  animateCube(distanceToCameraTarget)
  animateMoon(distanceToCameraTarget)
  animateCat()

  // controls.update();
  renderer.render(scene, camera);

  var delta = clock.getDelta();
  mixers.forEach((mixer) => mixer.update(delta));

  requestAnimationFrame(mainLoop);
}

const animateCamera = () => {
  const cameraPosition = camera.position.lerp(nextCameraPosition, 0.08);
  camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
};

const animateCube = (distanceToCameraTarget) => {
  cube.rotation.y += 0.003;
  cube.rotation.z += 0.003;
  cube.rotation.y += 0.01 * distanceToCameraTarget;
  cube.rotation.z += 0.01 * distanceToCameraTarget;
};

const animateMoon = (distanceToCameraTarget) => {
  moon.rotation.y += 0.005;
  moon.rotation.y += 0.075 * distanceToCameraTarget;
};


const animateAirplane = () => {
  airplane.position.y = 0.5 * Math.sin(step)
  airplane.position.x = -20 + 1 * Math.sin(step)
  airplane.rotateZ(-0.01 * Math.sin(step))
  airplane.rotateY(-0.004 * Math.cos(step+ Math.PI/4))
};

const animatePig = () => {
  cerdito.position.y = 0.8 * Math.cos(step)
  cerdito.position.x = -3 + 1 * Math.cos(step)
  cerdito.rotateZ(-0.01 * Math.cos(step))
};

const animateCat = () => {
  catmodel.position.y = -3 + 0.08 * Math.sin(step)
  catmodel.position.x = -24 + 0.05 * Math.sin(step)
  //catmodel.rotateZ(-0.01 * Math.sin(step))
};


window.addEventListener("resize", () => {
  // update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

mainLoop();
