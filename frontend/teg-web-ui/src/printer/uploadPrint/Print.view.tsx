import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useAsync } from 'react-async-hook';
import initSlicerRender, { start } from 'slicer-render';

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Slider from '@mui/material/Slider';

import LoadingOverlay from '../../common/LoadingOverlay'
import PrintDialogContentStyles from './PrintDialogContentStyles'

const meshFileExtensions = [
  // 'amf',
  'stl',
]

export const allFileExtensions = [
  ...meshFileExtensions,
  'gcode',
  'ngc',
].map(v => `.${v}`).join(',')

const MB = 1000 * 1000

const PrintView = ({
  isMutationPending,
  machine,
  userInputFile,
  loading,
  setLoading,
  setGCodeText,
  addToQueue,
  printNow,
  slice,
  sliceMutation,
}) => {

  console.log({ machine })
  return <Box/>
  const classes = PrintDialogContentStyles()


  const [size, setSize] = useState(0)
  const webGLContainer = useRef()


  const renderer = useAsync(async (forceLoad = false) => {
    const machineDimensions = [235, 235, 255]
    const {
      infiniteZ
    } = machine

    let gcodeText = '';
    let modelByteArray;
    // let slice = () => {}

    await initSlicerRender();

    const nextRenderer = start({
      machineDimensions,
      infiniteZ,
    });

      const res = await fetch(userInputFile.url)
      if (userInputFile.name.endsWith('.ngc') || userInputFile.name.endsWith('.gcode')) {
        const gcode = await res.text();

        setSize(gcode.length)
        if (!forceLoad && gcode.length > 80 * MB) {
          return;
        }

        nextRenderer.setGCode(
          userInputFile.text,
        );
    } else {
      const modelArrayBuffer = await res.arrayBuffer();

      setSize(modelArrayBuffer.byteLength)
      if (!forceLoad && modelArrayBuffer.byteLength > 80 * MB) {
        return;
      }

      modelByteArray = new Uint8Array(modelArrayBuffer.slice(0));

      console.log({ infiniteZ, machine })

      nextRenderer.addModel(
        userInputFile.name,
        modelByteArray,
      );

    //   // Disable 3D model rendering after slicing
    //   modelByteArray = new Uint8Array([]);
    //   gcodeText = data.slice
    }

    return nextRenderer;
  }, [])

  useEffect(() => {
    if (sliceMutation.data != null) {
      console.log('Slicing... [DONE]')
      renderer.result.setGCode(sliceMutation.data.slice)
    }
  }, [sliceMutation.data]);

  const asyncSetup = async () => {

    // // console.log({ gcodeText })
    // setGCodeText(gcodeText)

    // let startMillis = performance.now()
    // console.log('Starting JS Execution')

    // console.log({ name: files[0].name, modelByteArray, gcodeText })

    // gcodeText,

    // console.log(`Done JS Execution in ${performance.now() - startMillis}ms`)

    setLoading(false)
  }

  useLayoutEffect(() => {
    setLoading(true)
  }, [])

  return (
    <Box>
      { size > 80 * MB && !isMutationPending && (
        <Typography
          variant="h5"
          className={classes.largeFileMessage}
        >
          GCode preview disabled for large file (
          {(size / (1 * MB)).toFixed(1)}
          MB)
          <Button
            variant="contained"
            onClick={() => renderer.execute(true)}
            className={classes.enableButton}
          >
            Enable Preview
          </Button>
        </Typography>
      )}
      {/* <LoadingOverlay
        className={classes.webGLLoadingOverlay}
        loading={isMutationPending || (shouldLoad && loading)}
        loadingText={isMutationPending ? ('Uploading') : 'Loading Preview...'}
        transitionDelay={300}
        noSpinner={!isMutationPending}
      > */}
      <Box style={{ opacity: loading ? 0 : 1 }}>
        <Box style={{ display: 'flex'}}>
          <Box style={{ padding: 8 }}>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              name="gcode-layer-slider"
              style={{
                width: 200,
              }}
            />

            {/*
             <Slider
              name="gcode-layer-slider"
              orientation="vertical"
              aria-labelledby="gcode-layer-slider"
            /> */}
            <Button
              variant="contained"
              onClick={slice}
              disabled={userInputFile.isGCode || sliceMutation.loading}
            >
              Slice GCode
            </Button>
            {sliceMutation.loading && (
              <Typography>
                Slicing...
              </Typography>
            )}
            {sliceMutation.error && (
              <Typography color="error">
                {sliceMutation.error.message}
              </Typography>
            )}
          </Box>
          <canvas
            className={classes.webGLContainer}
            ref={webGLContainer}
          />
        </Box>
      </Box>
      <Button
          onClick={addToQueue}
          variant="outlined"
          disabled={loading || isMutationPending}
        >
          Add to Queue
        </Button>
        <Button
          onClick={printNow}
          variant="contained"
          disabled={machine?.status !== 'READY' || loading || isMutationPending}
        >
          Print Now
        </Button>
    </Box>
  )
}

export default PrintView
