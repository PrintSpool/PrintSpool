import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
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

const PrintDialogContent = ({
  submitting,
  machine,
  files,
  loading,
  setLoading,
  setGCodeText,
}) => {
  const classes = PrintDialogContentStyles()

  const largeFile = files[0].size > 80 * MB

  const [shouldLoad, setShouldLoad] = useState(!largeFile)
  const webGLContainer = useRef()

  const fileExt = files[0].name.split('.').pop()
  const isMesh = meshFileExtensions.includes(fileExt)

  const renderer = useAsync(async () => {
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

    if (isMesh) {
      const modelArrayBuffer = await files[0].arrayBuffer();
      modelByteArray = new Uint8Array(modelArrayBuffer.slice());


      console.log({ infiniteZ, machine })

      nextRenderer.addModel(
        files[0].name,
        modelByteArray,
      );

    //   // Disable 3D model rendering after slicing
    //   modelByteArray = new Uint8Array([]);
    //   gcodeText = data.slice
    } else {
      modelByteArray = new Uint8Array([]);
      gcodeText = await files[0].text()

      nextRenderer.setGCode(
        gcodeText,
      );
    }

    return nextRenderer;
  },[])

  const [sendSliceMutation, sliceMutation] = useMutation(gql`
    mutation($input: SliceInput!) {
      slice(input: $input)
    }
  `)

  const slice = () => {
      console.log('Slicing....')
      sendSliceMutation({
        variables: {
          input: {
            file: files[0],
            name: files[0].name,
          },
        }
      })
  }

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
    if (shouldLoad === false) {
      setLoading(false)
      return
    }
    if (loading === false) {
      setLoading(true)
    }

    asyncSetup()
  }, [shouldLoad])

  return (
    <div>
      {!shouldLoad && !submitting && (
        <Typography
          variant="h5"
          className={classes.largeFileMessage}
        >
          GCode preview disabled for large file (
          {(files[0].size / (1 * MB)).toFixed(1)}
          MB)
          <Button
            variant="contained"
            onClick={() => setShouldLoad(true)}
            className={classes.enableButton}
          >
            Enable Preview
          </Button>
        </Typography>
      )}
      {/* <LoadingOverlay
        className={classes.webGLLoadingOverlay}
        loading={submitting || (shouldLoad && loading)}
        loadingText={submitting ? ('Uploading') : 'Loading Preview...'}
        transitionDelay={300}
        noSpinner={!submitting}
      > */}
      <div style={{ opacity: shouldLoad && loading ? 0 : 1 }}>
        <div style={{ display: 'flex'}}>
          <div style={{ padding: 8 }}>
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
              disabled={!isMesh || sliceMutation.loading}
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
          </div>
          <canvas
            className={classes.webGLContainer}
            ref={webGLContainer}
          />
        </div>
      </div>
    </div>
  )
}

export default PrintDialogContent
