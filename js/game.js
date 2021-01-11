// Creating Objects

// Cylinder for the Sea

Sea = function () {
  // create the geometry (shape) of the cylinder;
  // the parameters are:
  // radius top, radius bottom, height, number of segments on the radius, number of segments vertically
  let geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  // important: by merging vertices we ensure the continuity of the waves
  geom.mergeVertices();

  // get the vertices
  let l = geom.vertices.length;

  // create an array to store new data associated to each vertex
  this.waves = [];

  for (let i = 0; i < l; i++) {
    // get each vertex
    let v = geom.vertices[i];

    // store some data associated to it
    this.waves.push({
      y: v.y,
      x: v.x,
      z: v.z,
      // a random angle
      ang: Math.random() * Math.PI * 2,
      // a random distance
      amp: 5 + Math.random() * 15,
      // a random speed between 0.016 and 0.048 radians / frame
      speed: 0.016 + Math.random() * 0.032
    });
  }

  // create the material
  let mat = new THREE.MeshPhongMaterial({
    color: Colors.blue,
    transparent: true,
    opacity: 0.6,
    shading: THREE.FlatShading
  });

  // To create an object in Three.js, we have to create a mesh
  // which is a combination of a geometry and some material
  this.mesh = new THREE.Mesh(geom, mat);

  // Allow the sea to receive shadows
  this.mesh.receiveShadow = true;
};

// now we create the function that will be called in each frame
// to update the position of the vertices to simulate the waves

Sea.prototype.moveWaves = function () {
  // get the vertices
  let verts = this.mesh.geometry.vertices;
  let l = verts.length;

  for (let i = 0; i < l; i++) {
    let v = verts[i];

    // get the data associated to it
    let vprops = this.waves[i];

    // update the position of the vertex
    v.x = vprops.x + Math.cos(vprops.ang) * vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang) * vprops.amp;

    // increment the angle for the next frame
    vprops.ang += vprops.speed;
  }

  // Tell the renderer that the geometry of the sea has changed.
  // In fact, in order to maintain the best level of performance,
  // three.js caches the geometries and ignores any changes
  // unless we add this line
  this.mesh.geometry.verticesNeedUpdate = true;

  sea.mesh.rotation.z += 0.005;
};

// Instantiate the sea and add it to the scene:

let sea;

function createSea() {
  sea = new Sea();

  // push it a little bit at the bottom of the scene
  sea.mesh.position.y = -600;

  // add the mesh of the sea to the scene
  scene.add(sea.mesh);
}

// Complex Shape: Cloud

Cloud = function () {
  // Create an empty container that will hold the different parts of the cloud
  this.mesh = new THREE.Object3D();

  // create a cube geometry;
  // this shape will be duplicated to create the cloud
  let geom = new THREE.BoxGeometry(20, 20, 20);

  // create a material; a simple white material will do the trick
  let mat = new THREE.MeshPhongMaterial({
    color: Colors.white
  });

  // duplicate the geometry a random number of times
  let nBlocs = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < nBlocs; i++) {
    // create the mesh by cloning the geometry
    let m = new THREE.Mesh(geom, mat);

    // set the position and the rotation of each cube randomly
    m.position.x = i * 15;
    m.position.y = Math.random() * 10;
    m.position.z = Math.random() * 10;
    m.rotation.z = Math.random() * Math.PI * 2;
    m.rotation.y = Math.random() * Math.PI * 2;

    // set the size of the cube randomly
    let s = 0.1 + Math.random() * 0.9;
    m.scale.set(s, s, s);

    // allow each cube to cast and to receive shadows
    m.castShadow = true;
    m.receiveShadow = true;

    // add the cube to the container we first created
    this.mesh.add(m);
  }
};

// Define a Sky Object
Sky = function () {
  // Create an empty container
  this.mesh = new THREE.Object3D();

  // choose a number of clouds to be scattered in the sky
  this.nClouds = 20;

  // To distribute the clouds consistently,
  // we need to place them according to a uniform angle
  let stepAngle = (Math.PI * 2) / this.nClouds;

  // create the clouds
  for (let i = 0; i < this.nClouds; i++) {
    let c = new Cloud();

    // set the rotation and the position of each cloud;
    // for that we use a bit of trigonometry
    let a = stepAngle * i; // this is the final angle of the cloud
    let h = 750 + Math.random() * 200; // this is the distance between the center of the axis and the cloud itself

    // Trigonometry!!! I hope you remember what you've learned in Math :)
    // in case you don't:
    // we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
    c.mesh.position.y = Math.sin(a) * h;
    c.mesh.position.x = Math.cos(a) * h;

    // rotate the cloud according to its position
    c.mesh.rotation.z = a + Math.PI / 2;

    // for a better result, we position the clouds
    // at random depths inside of the scene
    c.mesh.position.z = -400 - Math.random() * 400;

    // we also set a random scale for each cloud
    let s = 1 + Math.random() * 2;
    c.mesh.scale.set(s, s, s);

    // do not forget to add the mesh of each cloud in the scene
    this.mesh.add(c.mesh);
  }
};

// Now we instantiate the sky and push its center a bit
// towards the bottom of the screen

let sky;

function createSky() {
  sky = new Sky();
  sky.mesh.position.y = -600;
  scene.add(sky.mesh);
}

// Add Aviator: Dynamic geometry

const Pilot = function () {
  this.mesh = new THREE.Object3D();
  this.mesh.name = 'pilot';

  // angleHairs is a property used to animate the hair later
  this.angleHairs = 0;

  // Body of the pilot
  let bodyGeom = new THREE.BoxGeometry(15, 15, 15);
  let bodyMat = new THREE.MeshPhongMaterial({
    color: Colors.brown,
    shading: THREE.FlatShading
  });
  let body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.set(2, -12, 0);
  this.mesh.add(body);

  // Face of the pilot
  let faceGeom = new THREE.BoxGeometry(10, 10, 10);
  let faceMat = new THREE.MeshLambertMaterial({ color: Colors.pink });
  let face = new THREE.Mesh(faceGeom, faceMat);
  this.mesh.add(face);

  // Hair element
  let hairGeom = new THREE.BoxGeometry(4, 4, 4);
  let hairMat = new THREE.MeshLambertMaterial({ color: Colors.brown });
  let hair = new THREE.Mesh(hairGeom, hairMat);
  // Align the shape of the hair to its bottom boundary, that will make it easier to scale.
  hair.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 2, 0));

  // create a container for the hair
  let hairs = new THREE.Object3D();

  // create a container for the hairs at the top
  // of the head (the ones that will be animated)
  this.hairsTop = new THREE.Object3D();

  // create the hairs at the top of the head
  // and position them on a 3 x 4 grid
  for (let i = 0; i < 12; i++) {
    let h = hair.clone();
    let col = i % 3;
    let row = Math.floor(i / 3);
    let startPosZ = -4;
    let startPosX = -4;
    h.position.set(startPosX + row * 4, 0, startPosZ + col * 4);
    this.hairsTop.add(h);
  }
  hairs.add(this.hairsTop);

  // create the hairs at the side of the face
  let hairSideGeom = new THREE.BoxGeometry(12, 4, 2);
  hairSideGeom.applyMatrix(new THREE.Matrix4().makeTranslation(-6, 0, 0));
  let hairSideR = new THREE.Mesh(hairSideGeom, hairMat);
  let hairSideL = hairSideR.clone();
  hairSideR.position.set(8, -2, 6);
  hairSideL.position.set(8, -2, -6);
  hairs.add(hairSideR);
  hairs.add(hairSideL);

  // create the hairs at the back of the head
  let hairBackGeom = new THREE.BoxGeometry(2, 8, 10);
  let hairBack = new THREE.Mesh(hairBackGeom, hairMat);
  hairBack.position.set(-1, -4, 0);
  hairs.add(hairBack);
  hairs.position.set(-5, 5, 0);

  this.mesh.add(hairs);

  let glassGeom = new THREE.BoxGeometry(5, 5, 5);
  let glassMat = new THREE.MeshLambertMaterial({ color: Colors.brown });
  let glassR = new THREE.Mesh(glassGeom, glassMat);
  glassR.position.set(6, 0, 3);
  let glassL = glassR.clone();
  glassL.position.z = -glassR.position.z;

  let glassAGeom = new THREE.BoxGeometry(11, 1, 11);
  let glassA = new THREE.Mesh(glassAGeom, glassMat);
  this.mesh.add(glassR);
  this.mesh.add(glassL);
  this.mesh.add(glassA);

  let earGeom = new THREE.BoxGeometry(2, 3, 2);
  let earL = new THREE.Mesh(earGeom, faceMat);
  earL.position.set(0, 0, -6);
  let earR = earL.clone();
  earR.position.set(0, 0, 6);
  this.mesh.add(earL);
  this.mesh.add(earR);
};

// move the hair
Pilot.prototype.updateHairs = function () {
  // get the hair
  let hairs = this.hairsTop.children;

  // update them according to the angle angleHairs
  let l = hairs.length;
  for (let i = 0; i < l; i++) {
    let h = hairs[i];
    // each hair element will scale on cyclical basis between 75% and 100% of its original size
    h.scale.y = 0.75 + Math.cos(this.angleHairs + i / 3) * 0.25;
  }
  // increment the angle for the next frame
  this.angleHairs += 0.16;
};

// Complex Shapes: Airplane
const AirPlane = function () {
  this.mesh = new THREE.Object3D();

  // Cockpit

  let geomCockpit = new THREE.BoxGeometry(80, 50, 50, 1, 1, 1);
  let matCockpit = new THREE.MeshPhongMaterial({
    color: Colors.red,
    shading: THREE.FlatShading
  });

  // access a specific vertex of a shape through
  // the vertices array, and then move its x, y and z property:
  geomCockpit.vertices[4].y -= 10;
  geomCockpit.vertices[4].z += 20;
  geomCockpit.vertices[5].y -= 10;
  geomCockpit.vertices[5].z -= 20;
  geomCockpit.vertices[6].y += 30;
  geomCockpit.vertices[6].z += 20;
  geomCockpit.vertices[7].y += 30;
  geomCockpit.vertices[7].z -= 20;

  let cockpit = new THREE.Mesh(geomCockpit, matCockpit);
  cockpit.castShadow = true;
  cockpit.receiveShadow = true;
  this.mesh.add(cockpit);

  // Create the engine
  let geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
  let matEngine = new THREE.MeshPhongMaterial({
    color: Colors.white,
    shading: THREE.FlatShading
  });
  let engine = new THREE.Mesh(geomEngine, matEngine);
  engine.position.x = 40;
  engine.castShadow = true;
  engine.receiveShadow = true;
  this.mesh.add(engine);

  // Create the tail
  let geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
  let matTailPlane = new THREE.MeshPhongMaterial({
    color: Colors.red,
    shading: THREE.FlatShading
  });
  let tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
  tailPlane.position.set(-35, 25, 0);
  tailPlane.castShadow = true;
  tailPlane.receiveShadow = true;
  this.mesh.add(tailPlane);

  // Create the wing
  let geomSideWing = new THREE.BoxGeometry(40, 8, 150, 1, 1, 1);
  let matSideWing = new THREE.MeshPhongMaterial({
    color: Colors.red,
    shading: THREE.FlatShading
  });
  let sideWing = new THREE.Mesh(geomSideWing, matSideWing);
  sideWing.castShadow = true;
  sideWing.receiveShadow = true;
  this.mesh.add(sideWing);

  // propeller
  let geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
  let matPropeller = new THREE.MeshPhongMaterial({
    color: Colors.brown,
    shading: THREE.FlatShading
  });
  this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
  this.propeller.castShadow = true;
  this.propeller.receiveShadow = true;

  // blades
  let geomBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1);
  let matBlade = new THREE.MeshPhongMaterial({
    color: Colors.brownDark,
    shading: THREE.FlatShading
  });

  let blade = new THREE.Mesh(geomBlade, matBlade);
  blade.position.set(8, 0, 0);
  blade.castShadow = true;
  blade.receiveShadow = true;
  this.propeller.add(blade);
  this.propeller.position.set(50, 0, 0);
  this.mesh.add(this.propeller);

  // Pilot
  this.pilot = new Pilot();
  this.pilot.mesh.position.set(-10, 27, 0);
  this.mesh.add(this.pilot.mesh);
};

let airplane;

function createPlane() {
  airplane = new AirPlane();
  airplane.mesh.scale.set(0.25, 0.25, 0.25);
  airplane.mesh.position.y = 100;
  scene.add(airplane.mesh);
}

// The Lights

let hemisphereLight, shadowLight;

function createLights() {
  // A hemisphere light is a gradient colored light;
  // the first parameter is the sky color, the second parameter is the ground color,
  // the third parameter is the intensity of the light
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);

  // A directional light shines from a specific direction.
  // It acts like the sun, that means that all the rays produced are parallel.
  shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);

  // Set the direction of the light
  shadowLight.position.set(150, 350, 350);

  // Allow shadow casting
  shadowLight.castShadow = true;

  // define the visible area of the projected shadow
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;

  // define the resolution of the shadow; the higher the better,
  // but also the more expensive and less performant
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  // an ambient light modifies the global color of a scene and makes the shadows softer
  ambientLight = new THREE.AmbientLight(0xdc8874, 0.5);

  // to activate the lights, just add them to the scene
  scene.add(hemisphereLight);
  scene.add(shadowLight);
  scene.add(ambientLight);
}

// Setting up the Scene

let scene,
  camera,
  fieldOfView,
  aspectRatio,
  nearPlane,
  farPlane,
  HEIGHT,
  WIDTH,
  renderer,
  container;

function handleWindowResize() {
  // update height and width of the renderer and the camera
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

function createScene() {
  // Get the width and the height of the screen,
  // use them to set up the aspect ratio of the camera
  // and the size of the renderer.
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  // Create the scene
  scene = new THREE.Scene();

  // Add a fog effect to the scene; same color as the
  // background color used in the style sheet
  scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

  // Create the camera
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
  );

  // Set the position of the camera
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = 100;

  // Create the renderer
  renderer = new THREE.WebGLRenderer({
    // Allow transparency to show the gradient background
    // we defined in the CSS
    alpha: true,

    // Activate the anti-aliasing; this is less performant,
    // but, as our project is low-poly based, it should be fine :)
    antialias: true
  });

  // Define the size of the renderer; in this case,
  // it will fill the entire screen
  renderer.setSize(WIDTH, HEIGHT);

  // Enable shadow rendering
  renderer.shadowMap.enabled = true;

  // Add the DOM element of the renderer to the
  // container we created in the HTML
  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  // Listen to the screen: if the user resizes it
  // we have to update the camera and the renderer size
  window.addEventListener('resize', handleWindowResize, false);
}

// Rendering

function loop() {
  // Rotate the sea and the sky
  sea.mesh.rotation.z += 0.005;
  sky.mesh.rotation.z += 0.01;

  // update the plane on each frame
  updatePlane();

  // update sea
  sea.moveWaves();

  // render the scene
  renderer.render(scene, camera);

  // call the loop function again
  requestAnimationFrame(loop);
}

function updatePlane() {
  // move the airplane between -100 and 100 on the horizontal axis,
  // and between 25 and 175 on the vertical axis,
  // depending on the mouse position which ranges between -1 and 1 on both axes;
  // to achieve that we use a normalize function (see below)

  let targetX = normalize(mousePos.x, -1, 1, -100, 100);
  let targetY = normalize(mousePos.y, -1, 1, 25, 175);

  // update the airplane's position
  airplane.mesh.position.y += (targetY - airplane.mesh.position.y) * 0.1;
  airplane.propeller.rotation.x += 0.3;

  airplane.pilot.updateHairs();
}

function normalize(v, vmin, vmax, tmin, tmax) {
  let nv = Math.max(Math.min(v, vmax), vmin);
  let dv = vmax - vmin;
  let pc = (nv - vmin) / dv;
  let dt = tmax - tmin;
  let tv = tmin + pc * dt;
  return tv;
}

// Normalize mouse input

let mousePos = { x: 0, y: 0 };

// now handle the mousemove event

function handleMouseMove(event) {
  // here we are converting the mouse position value received
  // to a normalized value varying between -1 and 1;
  // this is the formula for the horizontal axis:

  let tx = -1 + (event.clientX / WIDTH) * 2;

  // for the vertical axis, we need to inverse the formula
  // because the 2D y-axis goes the opposite direction of the 3D y-axis

  let ty = 1 - (event.clientY / HEIGHT) * 2;
  mousePos = { x: tx, y: ty };
}

// Code Structure

function init() {
  // set up the scene, the camera and the renderer
  createScene();

  // add the lights
  createLights();

  // add the objects
  createPlane();
  createSea();
  createSky();

  //add the listener
  document.addEventListener('mousemove', handleMouseMove, false);

  // start a loop that will update the objects' positions
  // and render the scene on each frame
  loop();
}

window.addEventListener('load', init, false);
