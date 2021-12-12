import ReactDOM from 'react-dom'

import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three'
import {FileFormats, Unified3dLoader} from 'unified-3d-loader';
import {CuraWASM} from 'cura-wasm';
import {resolveDefinition} from 'cura-wasm-definitions';

import GCodeLoader from './GCodeLoader'
import OrbitControls from './OrbitControls'

import readFile from '../../../common/readFile'

const meshFileExtensions = new Map(Object.entries({
  '3mf': FileFormats._3MF,
  amf: FileFormats.AMF,
  obj: FileFormats.OBJ,
  ply: FileFormats.PLY,
  stl: FileFormats.STL,
}))

export const allFileExtensions = [
  ...meshFileExtensions.keys(),
  'gcode',
  'ngc',
].map(v => `.${v}`).join(',')

const renderGCode = (files, containerRef, setLoading) => {
  // eslint-disable-next-line react/no-find-dom-node
  const containerElement = ReactDOM.findDOMNode(containerRef.current)

  const getSize = () => {
    const width = containerElement.offsetWidth
    const height = containerElement.offsetHeight
    return {
      width,
      height,
      aspect: width / height,
    }
  }

  const initialSize = getSize()
  const camera = new PerspectiveCamera(90, initialSize.aspect, 0.1, 10000)

  // eslint-disable-next-line no-new
  const controls = new OrbitControls(camera)
  camera.position.set(0, 0, 80)
  controls.update()

  // const controls = new OrbitControls(camera)
  const scene = new Scene()

  const renderer = new WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(initialSize.width, initialSize.height)

  const resize = () => {
    const { aspect, width, height } = getSize()
    camera.aspect = aspect
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  window.addEventListener('resize', resize, false)

  let continueAnimation = true

  const animate = () => {
    if (!continueAnimation) return

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }

  const asyncSetup = async () => {
    const fileExt = files[0].name.split('.').pop()

    if (meshFileExtensions.has(fileExt)) {
      const fileContent = await files[0].arrayBuffer();

      //Create a new slicer
      const slicer = new CuraWASM({
        /**
         * Specify Cura Engine launch arguments (Identical to desktop Cura Engine).
         *
         * If you find that "-s" overrides aren't taking effect, make sure that you
         * order your arguments correctly.
         *
         * NOTE: You CANNOT specify both this setting and overrides!
         */
        // command: 'slice -j definitions/printer.def.json -o Model.gcode -s layer_height=0.06 -l Model.stl',

        /*
        * The 3D printer definition to slice for (See the cura-wasm-definitions
        * repository or https://github.com/cloud-cnc/cura-wasm-definitions
        * for a list of built-in definitions)
        */
        definition: resolveDefinition('ultimaker2'),

        /*
        * Overrides for the current 3D printer definition (Passed to Cura Engine
        * with the -s CLI argument)
        *
        * NOTE: You CANNOT specify both this setting and launch arguments!
        */
        overrides: [
          // {
          //   /*
          //   * The scope of the setting. (Passed to Cura Engine with a leading
          //   * hyphen before the corresponding -s argument)
          //   */
          //   scope: 'e0',

          //   //The override's key/name
          //   key: 'mesh_position_x',

          //   //The override's value
          //   value: -10
          // }
        ],

        /**
         * Wether or not to transfer the input STL ArrayBuffer to the worker thread
         * (Prevents duplicating large amounts of memory but empties the ArrayBuffer
         * on the main thread preventing other code from using the ArrayBuffer)
         */
        transfer: true,

        /*
        * Wether to enable verbose logging (Useful for debugging; allows Cura
        * Engine to directly log to the console)
        */
        verbose: true
      });

      // //Instantiate a new loader
      // const loader = new Unified3dLoader();

      // //Progress logger (Ranges from 0 to 100)
      // loader.on('progress', percent =>
      // {
      //   console.log(`Loading Progress: ${percent}%`);
      // });

      // console.log(meshFileExtensions.get(fileExt))
      // const { vertices } = await loader.load(fileContent, meshFileExtensions.get(fileExt), false);

      // const material = new THREE.MeshLambertMaterial( { color: 0xF5F5F5 } );

      // const geometry = new THREE.BufferGeometry();
      // geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
      // const mesh = new THREE.Mesh( geometry, material );

      // scene.add(mesh)

      //Progress logger (Ranges from 0 to 100)
      slicer.on('progress', percent =>
      {
        console.log(`Slicing Progress: ${percent}%`);
      });

      //Slice (This can take multiple minutes to resolve!)
      const { gcode, metadata } = await slicer.slice(fileContent, 'stl');

      console.log('file sliced!', { metadata })

      // //Dispose (Reccomended but not necessary to call/intended for SPAs)
      // slicer.dispose();

      const gcodeText = new TextDecoder("utf-8").decode(gcode)
      const gcodeObject = new GCodeLoader().parse(gcodeText)
      gcodeObject.position.set(-100, -20, 100)
      scene.add(gcodeObject)
    } else {
      const gcodeText = await readFile(files[0])
      const gcodeObject = new GCodeLoader().parse(gcodeText)
      gcodeObject.position.set(-100, -20, 100)
      scene.add(gcodeObject)
    }

    containerElement.appendChild(renderer.domElement)

    animate()
    setLoading(false)
  }

  asyncSetup()

  const cleanup = () => {
    continueAnimation = false
    renderer.dispose()
    scene.dispose()
    controls.dispose()
  }

  return cleanup
}

export default renderGCode
