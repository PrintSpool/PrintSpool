import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useAsync, useAsyncCallback } from 'react-async-hook';
import initSlicerRender, { start } from 'slicer-render';

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';

import { drawerWidth } from '../common/frame/components/Drawer.styles'
import CircularProgress from '@mui/material/CircularProgress';

const MB = 1000 * 1000

export interface Vec3 {
  x: number
  y: number
  z: number
}

export interface Vec4 {
  x: number
  y: number
  z: number
  w: number
}

export interface PrintFile {
  id: number
  name: string
  url: string
  isMesh: boolean
  meshVersion: number
  gcodeVersion: number
  gcodeBlob: null | Blob
  gcodeText: null | string
  quantity: number
  mat4: { x: Vec4, y: Vec4, z: Vec4, w: Vec4 }
  rotationMat3: { x: Vec3, y: Vec3, z: Vec3 }
  position: Vec3
  positionWithOffset: Vec3
  scale: Vec3
}

const PrintViewerCore = ({
  machine,
  slicerEngine,
  printFile,
  onEvent = () => {},
  render: renderOverlay,
  hideCanvas = false,
}: {
  machine: any,
  slicerEngine: any,
  printFile: PrintFile | null,
  onEvent?: any,
  render: any,
  hideCanvas?: boolean,
}) => {
  const [viewMode, setViewMode] = useState('model')

  const [data, setData] = useState({
    size: 0,
    topLayer: 100,
    layer: 100,
    modelDimensions: {
      x: 1,
      y: 1,
      z: 1,
    },
  });

  const {
    size,
    // layer,
  } = data;

  const webGLContainer = useRef()


  const rendererAsync = useAsyncCallback(async () => {
    const machineDimensions = [235, 235, 255]
    const {
      infiniteZ
    } = machine

    console.log('Starting Slicer-Render')

    await initSlicerRender();

    const nextRenderer = start({
      machineDimensions,
      infiniteZ,
      invertRotation: slicerEngine.invertRotation,
    }, (event) => {
      if (event.type === 'viewModeChange') {
        setViewMode(event.value)
      }
      onEvent(event);
    });

    return nextRenderer;
  });

  // Load the renderer after the canvas is added to the DOM
  useLayoutEffect(() => {
    rendererAsync.execute()
  }, []);

  const { result: renderer } = rendererAsync;

  const printFileLoader = useAsync(async (forceLoad = false) => {
    // Update renderer on page load, printFile change and user-requested force large file render
    if (renderer == null) {
      return
    }

    if (printFile == null) {
      return true
    }

    let res
    try {
      res = await fetch(printFile.url)
    } catch (e) {
      console.warn('Unable to load user input file. Most likely a page reload, rendering nothing.');
      return true
    }

    renderer.send('reset');
    if (printFile.isMesh) {
      const modelArrayBuffer = await res.arrayBuffer();

      setData((data) => ({
        ...data,
        size: modelArrayBuffer.byteLength,
      }))

      // if (!forceLoad && modelArrayBuffer.byteLength > 80 * MB) {
      //   return;
      // }

      const modelByteArray = new Uint8Array(modelArrayBuffer.slice(0));

      // console.log({ infiniteZ, machine }, modelArrayBuffer.byteLength)

      const { size: modelDimensions } = renderer.addModel(
        printFile.name,
        modelByteArray,
      );

      setData({
        size: 0,
        topLayer: 100,
        layer: 100,
        modelDimensions,
      })
    } else {
      const gcode = await res.text();

      if (!forceLoad && gcode.length > 80 * MB) {
        setData((data) => ({
          ...data,
          size: gcode.length,
        }))

        return true;
      }

      const { topLayer } = renderer.setGCode(gcode);

      setData({
        size: gcode.length,
        topLayer,
        layer: topLayer,
        modelDimensions: { x: 0, y: 0, z: 0 },
      })
    }

    renderer.send('updateCameraTarget');
    return true;
  }, [printFile?.id, renderer])


  useEffect(() => {
    // Update renderer after server-side slicing returns new GCode
    if (printFile?.gcodeText != null && renderer != null) {
      console.log('Slicing... [DONE]')
      const { topLayer } = renderer.setGCode(printFile.gcodeText)
      setData((data) => ({
        ...data,
        topLayer,
        layer: topLayer,
      }));
    }
  }, [printFile?.gcodeVersion, renderer]);

  const error =
    rendererAsync.error
    ?? printFileLoader.error

  if (error != null) {
    throw error;
  }

  const loading = printFileLoader.result !== true || printFileLoader.loading

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateRows: '1fr max-content',
    }}>
      {/* Preview Disabled Message */}
      { size > 80 * MB && (
        <Typography
          variant="h5"
          sx={{
            position: 'absolute',
            left: '0',
            top: '40vh',
            textAlign: 'center',
            width: '100%',
          }}
        >
          GCode preview disabled for large file (
          {(size / (1 * MB)).toFixed(1)}
          MB)
          <Button
            variant="contained"
            onClick={() => printFileLoader.execute(true as any)}
            sx={{
              marginLeft: '2rem',
            }}
          >
            Enable Preview
          </Button>
        </Typography>
      )}
      {/* Canvas + Button & Inputs Grid */}
      <Box sx={{
        display: 'grid',
      }}>
        {/* Buttons & Inputs */}
        <Box sx={{
          padding: 2,
          gridArea: '1 / 1',
          display: 'grid',
          justifyContent: 'space-between',
          gridTemplateColumns: '[main-start hd-start] 1fr [hd-end quality-start] auto [quality-end layer-start] auto [layer-end main-end]',
          gridTemplateRows: '[main-start hd-start layer-start] auto [hd-end] 1fr [layer-end print-start] auto [print-end main-end]',
        }}>

          {renderOverlay({
            renderer,
            setData,
            data,
            viewMode,
          })}

          {/* GCode Layer Slider */}
          <Box sx={{
            zIndex: 10,
            height: '100%',
            pt: 1,
            pb: 3,
            gridArea: 'layer',
            display: {
              xs: 'none',
              md: hideCanvas ? 'none' : 'block',
            },
          }}>
            <Slider
              key={data.topLayer}
              orientation="vertical"
              defaultValue={data.topLayer}
              max={data.topLayer}
              disabled={printFile?.gcodeVersion == null}
              onChange={(e, val: number) => {
                renderer.send({ setLayer: val });
              }}
            />
          </Box>
        </Box>

        {/* 3D Preview Canvas */}
        <Box sx={{
          display: hideCanvas ? 'none' : 'grid',
          overflow: 'hidden',
          gridArea: '1 / 1',
          opacity: loading ? 0 : 1,
        }}>
          <Box
            component="canvas"
            ref={webGLContainer}
            sx={{
              marginLeft: { md: `${-drawerWidth / 2}px` },
              // Offset for top navigation
              marginTop: `${(80+53) / 2}px`,
              zIndex: 1,
            }}
          />
        </Box>

        {/* Loading Spinner */}
        { loading && (
          <Box sx={{
            display: 'grid',
            overflow: 'hidden',
            gridArea: '1 / 1',
            justifyItems: 'center',
            alignItems: 'center',
          }}>
            <CircularProgress disableShrink />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default PrintViewerCore
