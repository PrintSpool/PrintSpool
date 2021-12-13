import initSlicerRender, { render_string as renderString } from 'slicer-render';
import gcodeText from 'bundle-text:./example.gcode';

const run = async () => {
  await initSlicerRender();
  renderString(gcodeText);
}

run()
