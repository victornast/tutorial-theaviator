function init() {
  // set up the scene, the camera and the renderer
  createScene();

  // add the lights
  createLights();

  // add the objects
  createPlane();
  createSea();
  createSky();

  // start a loop that will update the objects' positions
  // and render the scene on each frame
  loop();
}

window.addEventListener('load', init, false);
