import React, { useLayoutEffect, useRef, useState } from 'react'
import initSlicerRender, { render_string as renderString } from 'slicer-render';

import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Slider from '@material-ui/core/Slider';

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
}) => {
  const classes = PrintDialogContentStyles()

  const largeFile = files[0].size > 80 * MB

  const [shouldLoad, setShouldLoad] = useState(!largeFile)
  const webGLContainer = useRef()

  const asyncSetup = async () => {
    const machineDimensions = [235, 235, 255]
    const {
      infiniteZ
    } = machine

    const fileExt = files[0].name.split('.').pop()
    let gcodeText = '';
    let modelByteArray;
    let slice = () => {}

    if (meshFileExtensions.includes(fileExt)) {
      const modelArrayBuffer = await files[0].arrayBuffer();
      modelByteArray = new Uint8Array(modelArrayBuffer.slice());

      // Dynamically load the slicer to improve page load times when it is not needed
      const { default: createSlicer } = await import('./createSlicer');

      slice = createSlicer({
        modelArrayBuffer,
        machineDimensions,
      })
    } else {
      modelByteArray = new Uint8Array([]);
      gcodeText = await files[0].text()
    }

    let start = performance.now()
    console.log('Starting JS Execution')
    await initSlicerRender();

    console.log({ name: files[0].name, modelByteArray, gcodeText })

    console.log({ infiniteZ, machine })
    const renderOptions = {
      machineDimensions,
      infiniteZ,
      fileNames: files.map((f) => f.name),
    }

    renderString(
      modelByteArray,
      gcodeText,
      renderOptions,
    );

    console.log(`Done JS Execution in ${performance.now() - start}ms`)

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
