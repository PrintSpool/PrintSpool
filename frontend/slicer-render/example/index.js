import initSlicerRender, { render_string as renderString } from '@d1plo1d/slicer-render';
import modelURL from 'url:./example.stl';
import gcodeText from 'bundle-text:./example.gcode';

const run = async () => {
  console.log({ modelURL })
  // const machineDimensions = [235, 235, 255]
  const machineDimensions = [200, 235, 255]

  const req = await fetch(modelURL)
  const modelBytes = await req.arrayBuffer()
  // console.log('Starting JS Execution')
  // let modelBytes = [];
  // for(var i = 0; i < modelText.length; i++) {
  //     var char = modelText.charCodeAt(i);
  //     modelBytes.push(char >>> 8);
  //     modelBytes.push(char & 0xFF);
  // }
  const modelByteArray = new Uint8Array(modelBytes);
  console.log(modelByteArray)

  let start = performance.now()
  await initSlicerRender();

  renderString(
    modelByteArray,
    gcodeText,
    {
      fileNames: ['example.stl'],
      machineDimensions,
      // alwaysShowModel: true,
      infiniteZ: true,
    }
  );

  // renderString(null, null, gcodeText);
  console.log(`Done JS Execution in ${performance.now() - start}ms`)
}

run()
