import initSlicerRender, { start } from '@d1plo1d/slicer-render';
import modelURL from 'url:./example.stl';
import gcodeText from 'bundle-text:./example.gcode';
import gcodeTextInfiniteZ from 'bundle-text:/example-infinite-z.gcode'

const showGCode = true;
const demoMode = null // 'spin' || null
const infiniteZ = true

const run = async () => {
  const machineDimensions = [235, 235, infiniteZ ? 10_000 : 255]
  console.log(machineDimensions)

  let startTime = performance.now()
  await initSlicerRender();

  const opts = {
    fileNames: ['example.stl'],
    machineDimensions,
    // alwaysShowModel: true,
    infiniteZ,
  };

  const renderer = start(opts, (event) => console.log({ event }));

  if (showGCode) {
    const { topLayer } = renderer.setGCode(infiniteZ ? gcodeTextInfiniteZ : gcodeText);

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

  renderer.send('updateCameraTarget');
  renderer.send({ setCameraPosition: 'isometric' });

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
