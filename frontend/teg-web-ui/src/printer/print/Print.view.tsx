import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useAsync } from 'react-async-hook';
import initSlicerRender, { start } from 'slicer-render';

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';

import Moving from '@mui/icons-material/Moving';
import ThreeSixtyIcon from '@mui/icons-material/ThreeSixty';
import PhotoSizeSelectSmallIcon from '@mui/icons-material/PhotoSizeSelectSmall';
import FlipIcon from '@mui/icons-material/Flip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
import LoadingOverlay from '../../common/LoadingOverlay'
import PrintDialogContentStyles from './PrintDialogContentStyles'
import { drawerWidth } from '../common/frame/components/Drawer.styles'
import ButtonGroup from '@mui/material/ButtonGroup';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

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
  setGCodeText,
  addToQueue,
  printNow,
  slice,
  sliceMutation,
}) => {
  const classes = PrintDialogContentStyles()


  const [data, setData] = useState({
    size: 0,
  });
  const {
    size,
  } = data;

  const webGLContainer = useRef()


  const rendererAsync = useAsync(async (forceLoad = false) => {
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

    let res
    try {
      res = await fetch(userInputFile.url)
    } catch (e) {
      console.warn('Unable to load user input file. Most likely a page reload, rendering nothing.');
      return nextRenderer
    }

    if (userInputFile.name.endsWith('.ngc') || userInputFile.name.endsWith('.gcode')) {
      const gcode = await res.text();

      setData({
        size: gcode.length,
      })

      if (!forceLoad && gcode.length > 80 * MB) {
        return;
      }

      nextRenderer.setGCode(gcode);
    } else {
      const modelArrayBuffer = await res.arrayBuffer();

      setData({
        size: modelArrayBuffer.byteLength,
      })

      if (!forceLoad && modelArrayBuffer.byteLength > 80 * MB) {
        return;
      }

      modelByteArray = new Uint8Array(modelArrayBuffer.slice(0));

      console.log({ infiniteZ, machine }, modelArrayBuffer.byteLength)

      nextRenderer.addModel(
        userInputFile.name,
        modelByteArray,
      );
    }

    return nextRenderer;
  }, [])

  if (rendererAsync.error != null) {
    throw rendererAsync.error;
  }

  const { result: renderer } = rendererAsync;

  useEffect(() => {
    if (sliceMutation.data != null) {
      console.log('Slicing... [DONE]')
      renderer.setGCode(sliceMutation.data.slice)
    }
  }, [sliceMutation.data]);

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateRows: '1fr max-content',
    }}>
      {/* Preview Disabled Message */}
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
            onClick={() => rendererAsync.execute(true)}
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
              {userInputFile.name}
            </Typography>
            <TextField
              label="Qty"
              size="small"
              defaultValue="1"
              sx={{
                mt: 2,
                zIndex: 2,
                position: 'relative',
              }}
            />
            <TextField
              label="Printer"
              size="small"
              defaultValue={machine.name}
              sx={{
                mt: 2,
                zIndex: 2,
                position: 'relative',
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
              // name="gcode-layer-slider"
              orientation="vertical"
            />
          </Box>

          {/* Editing Buttons (eg. Rotate) */}
          <Box
            sx={{
              mt: 2,
              mb: 2,
              zIndex: 2,
              position: 'relative',
              gridArea: 'main',
              justifySelf: 'left',
              alignSelf: 'center',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <ButtonGroup
              variant="outlined"
              orientation="vertical"
              aria-label="3d model manipulation"
              sx={{
                ml: -4,
                "& .MuiButton-root": {
                  pl: 3,
                  pr: 1,
                },
              }}
            >
              <Button aria-label="rotate" size="large">
                <ThreeSixtyIcon/>
              </Button>
              <Button aria-label="scale" size="large">
                <PhotoSizeSelectSmallIcon/>
              </Button>
              <Button aria-label="flip" size="large">
                <FlipIcon/>
              </Button>
              <Button aria-label="move" size="large">
                <Moving/>
              </Button>
            </ButtonGroup>
          </Box>


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
              {sliceMutation.loading && (
                <Typography sx={{ mb: 2 }}>
                  Slicing...
                </Typography>
              )}
              {sliceMutation.error && (
                <Typography color="error" sx={{ mb: 2 }}>
                  {sliceMutation.error.message}
                </Typography>
              )}
            </Box>
            <Button
              variant="outlined"
              onClick={async () => {
                const res = await fetch(userInputFile.url);
                const file = await res.blob();

                slice({
                  name: userInputFile.name,
                  file,
                })
              }}
              disabled={userInputFile.isGCode || sliceMutation.loading}
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
              Add to Queue
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
      </Box>
    </Box>
  )
}

export default PrintView
