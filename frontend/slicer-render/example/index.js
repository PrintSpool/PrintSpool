import initSlicerRender, { render_string as renderString } from 'slicer-render';
import gcodeText from 'bundle-text:./example.gcode';

const run = async () => {
  let start = performance.now()
  console.log('Starting JS Execution')
  await initSlicerRender();
  renderString(gcodeText);
  console.log(`Done JS Execution in ${performance.now() - start}ms`)
}

run()
