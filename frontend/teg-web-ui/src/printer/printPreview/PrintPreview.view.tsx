import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useAsync, useAsyncCallback } from 'react-async-hook';
import initSlicerRender, { start } from 'slicer-render';

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import LinearProgress from '@mui/material/LinearProgress';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

// @ts-ignore
import View3D from './icons/View3D.svg';
// @ts-ignore
import ViewFront from './icons/ViewFront.svg';
// @ts-ignore
import ViewTop from './icons/ViewTop.svg';
// @ts-ignore
import ViewLeft from './icons/ViewLeft.svg';
// @ts-ignore
import ViewRight from './icons/ViewRight.svg';

import ServerBreadcrumbs from '../common/ServerBreadcrumbs';
import { drawerWidth } from '../common/frame/components/Drawer.styles'
import EditButtonsDesktopView from './EditButtons.desktop.view';
import CircularProgress from '@mui/material/CircularProgress';

const hideFeatureStubs = true;

const meshFileExtensions = [
  // 'amf',
  'stl',
]

export const allFileExtensions = ({ featureFlags }) => [
  ...(featureFlags.includes('slicer') ? meshFileExtensions : []),
  'gcode',
  'ngc',
].map(v => `.${v}`).join(',')

const MB = 1000 * 1000

const PrintView = ({
  isMutationPending,
  isUploading,
  machine,
  slicerEngine,
  printQueues,
  printFiles,
  printFile,
  setPrintFileIndex,
  loading: externalLoading,
  setQuantity,
  addToQueue,
  printNow,
  slice,
  sliceMutation,
  onEvent,
}) => {
  const printFileIndex = printFiles.indexOf(printFile);

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
    layer,
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

    let res
    try {
      res = await fetch(printFile.url)
    } catch (e) {
      console.warn('Unable to load user input file. Most likely a page reload, rendering nothing.');
      return renderer
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

        return;
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
  }, [printFileIndex, renderer])

  useEffect(() => {
    // Update renderer after server-side slicing returns new GCode
    if (printFile.gcodeText != null && renderer != null) {
      console.log('Slicing... [DONE]')
      const { topLayer } = renderer.setGCode(printFile.gcodeText)
      setData((data) => ({
        ...data,
        topLayer,
        layer: topLayer,
      }));
    }
  }, [printFile.gcodeVersion, renderer]);

  const error =
    rendererAsync.error
    ?? printFileLoader.error

  const loading =
    externalLoading
    || rendererAsync.loading
    || printFileLoader.loading

  if (error != null) {
    throw error;
  }

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateRows: '1fr max-content',
    }}>
      {/* Preview Disabled Message */}
      { size > 80 * MB && !isMutationPending && (
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
            onClick={() => printFileLoader.execute(true)}
            sx={{
              marginLeft: '2rem',
            }}
          >
            Enable Preview
          </Button>
        </Typography>
      )}
      {/* <LoadingOverlay
        sx={{
          minWidth: '80vw',
          height: '60vh',
          marginLeft: -24,
          marginRight: -24,
        }}
        loading={isMutationPending || (shouldLoad && loading)}
        loadingText={isMutationPending ? ('Uploading') : 'Loading Preview...'}
        transitionDelay={300}
        noSpinner={!isMutationPending}
      > */}

      {/* Canvas + Button & Inputs Grid */}
      <Box sx={{
        opacity: externalLoading ? 0 : 1,
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
          {/* Headers */}
          <Box sx={{
            gridArea: 'hd',
          }}>
            <ServerBreadcrumbs
              machineName={machine.name}
              sx={{
                zIndex: 2,
                position: 'relative',
              }}
            >
              <Typography color="textPrimary">Print Preview</Typography>
            </ServerBreadcrumbs>
            <Typography
              variant="h1"
              sx={{
                mt: 1,
                zIndex: 2,
                position: 'relative',
              }}
            >
              {printFile.name}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: 2,
                zIndex: 2,
                position: 'relative',
              }}
            >
              Part
              <IconButton
                disabled={printFileIndex <= 0}
                onClick={() => setPrintFileIndex(printFileIndex - 1)}
              >
                <KeyboardArrowLeftIcon />
              </IconButton>
              {`${printFileIndex + 1} of ${printFiles.length}`}
              <IconButton
                disabled={printFileIndex >= printFiles.length - 1}
                onClick={() => setPrintFileIndex(printFileIndex + 1)}
              >
                <KeyboardArrowRightIcon />
              </IconButton>
            </Typography>
            <TextField
              label="Print Queue"
              size="small"
              defaultValue={printQueues[0].name}
              sx={{
                mt: 2,
                zIndex: 2,
                position: 'relative',
                display: hideFeatureStubs ? 'none' : null,
              }}
            />
            <TextField
              label="Printer"
              size="small"
              defaultValue={machine.name}
              sx={{
                mt: 2,
                mr: 2,
                zIndex: 2,
                position: 'relative',
                display: hideFeatureStubs ? 'none' : null,
              }}
            />
            <TextField
              label="Qty"
              size="small"
              type="number"
              inputProps={{
                min: 1,
              }}
              value={printFile.quantity}
              onChange={e => setQuantity(parseInt(e.target.value, 10))}
              sx={{
                mt: 2,
                zIndex: 2,
                position: 'relative',
                display: 'block',
              }}
            />
          </Box>

          <Box sx={{
            gridColumn: 'quality',
            gridRow: 'hd',
            justifySelf: 'right',
            ml: 2,
            mr: 2,
            maxWidth: '60%',
            display: hideFeatureStubs ? 'none' : null,
          }}>
            <Accordion sx={{
              zIndex: 2,
              position: 'relative',
            }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
              >
                <Typography>Standard Quality</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                  malesuada lacus ex, sit amet blandit leo lobortis eget.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* GCode Layer Slider */}
          <Box sx={{
            zIndex: 2,
            height: '100%',
            pt: 1,
            pb: 3,
            gridArea: 'layer',
          }}>
            <Slider
              key={data.topLayer}
              orientation="vertical"
              defaultValue={data.topLayer}
              max={data.topLayer}
              disabled={printFile.gcodeVersion == null}
              onChange={(e, val: number) => {
                renderer.send({ setLayer: val });
              }}
            />
          </Box>

          {/* Editing Buttons (eg. Rotate) */}
          <EditButtonsDesktopView {...{
            key: printFile.id,
            printFile,
            slicerEngine,
            renderer,
          }} />

          {/* Camera Positions */}
          <Box
            sx={{
              mb: 1,
              zIndex: 2,
              position: 'relative',
              gridColumn: 'hd',
              gridRow: 'print',
              alignSelf: 'end',
            }}
          >
            {
              [
                {
                  SVG: View3D,
                  label: 'View 3D Perspective',
                  cameraPosition: 'isometric'
                },
                {
                  SVG: ViewFront,
                  label: 'View Front',
                  cameraPosition: 'front'
                },
                {
                  SVG: ViewTop,
                  label: 'View Top',
                  cameraPosition: 'top'
                },
                {
                  SVG: ViewLeft,
                  label: 'View Left',
                  cameraPosition: 'left'
                },
                {
                  SVG: ViewRight,
                  label: 'View Right',
                  cameraPosition: 'right'
                },
              ].map(({ SVG, label, cameraPosition }) => (
                <IconButton
                  key={cameraPosition}
                  aria-label={label}
                  size="large"
                  onClick={() => renderer.send({ setCameraPosition: cameraPosition })}
                >
                  <SvgIcon>
                    <SVG />
                  </SvgIcon>
                </IconButton>
              ))
            }
          </Box>

          {/* Preview / Print Buttons */}
          <Paper sx={{
            mt: 2,
            mb: 2,
            ml: 2,
            mr: 1,
            p: 2,
            zIndex: 2,
            gridColumn: 'main',
            gridRow: 'print',
            justifySelf: 'end',
          }}>
            <Box>
              {(sliceMutation.loading || isUploading) && (
                <>
                  <Typography sx={{ mb: 1 }}>
                    { sliceMutation.loading ? 'Slicing...' : 'Uploading...'}
                  </Typography>
                  <LinearProgress sx={{ mb: 2 }} />
                </>
              )}
              {sliceMutation.error && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {sliceMutation.error.message}
                </Typography>
              )}
            </Box>
            { printFile.meshVersion === printFile.gcodeVersion && printFile.isMesh &&
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="View GCode"
                value={viewMode === 'gcode'}
                onChange={(e, checked) => {
                  renderer.send({ setViewMode: checked ? 'gcode' : 'model' })
                }}
                sx={{
                  display: 'block',
                  mb: 2,
                }}
              />
            }
            <Button
              variant="outlined"
              onClick={() => slice(printFile)}
              disabled={
                loading || isMutationPending || printFile.meshVersion === printFile.gcodeVersion
              }
              sx={{
                mr: 1,
              }}
            >
              Preview GCode
            </Button>
            <Button
              onClick={addToQueue}
              variant="outlined"
              disabled={loading || isMutationPending}
              sx={{
                mr: 1,
              }}
            >
              Add ({printFiles.length}) to Queue
            </Button>
            <Button
              onClick={printNow}
              variant="contained"
              disabled={machine?.status !== 'READY' || loading || isMutationPending}
            >
              Print Now
            </Button>
          </Paper>
        </Box>
        {/* 3D Preview Canvas */}
        <Box sx={{
          display: 'grid',
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
        { printFileLoader.loading && (
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

export default PrintView
