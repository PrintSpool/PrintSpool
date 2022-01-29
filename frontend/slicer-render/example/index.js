import initSlicerRender, { start } from '@d1plo1d/slicer-render';
import modelURL from 'url:./example.stl';
import gcodeText from 'bundle-text:./example.gcode';

const showGCode = false;
const demoMode = null // 'spin' || null

const run = async () => {
  // const machineDimensions = [235, 235, 255]
  const machineDimensions = [200, 235, 255]

  let startTime = performance.now()
  await initSlicerRender();

  const opts = {
    fileNames: ['example.stl'],
    machineDimensions,
    // alwaysShowModel: true,
    infiniteZ: true,
  };

  const renderer = start(opts, (event) => console.log({ event }));

  if (showGCode) {
    const { topLayer } = renderer.setGCode(gcodeText);

    const [layerSliderEl] = document.getElementsByName('gcode-layer-slider');
    layerSliderEl.max = topLayer;
    layerSliderEl.value = topLayer;
    layerSliderEl.addEventListener(
      'input',
      () => {
        // console.log(layerSliderEl.value)
        renderer.send({ setLayer: parseInt(layerSliderEl.value, 10) });
      },
      false,
    );
  } else {
    const res = await fetch(modelURL)
    const modelArrayBuffer = await res.arrayBuffer();
    const modelByteArray = new Uint8Array(modelArrayBuffer.slice(0));
    const { size } = renderer.addModel('example.stl', modelByteArray)
    console.log({ size });

    if (demoMode === 'spin') {
      let rotation = 0;

      setInterval(() => {
        rotation += 10;
        renderer.send({ setModelRotation: { z: rotation }})
      }, 50)
    }
  }

  const exitButton = document.getElementById('exit');
  exitButton.addEventListener(
    'click',
    () => {
      // console.log(layerSliderEl.value)
      renderer.send('exit');
    },
    false,
  );


  // renderString(null, null, gcodeText);
  console.log(`Done JS Execution in ${performance.now() - startTime}ms`)
}

run()
