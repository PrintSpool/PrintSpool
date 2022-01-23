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
import LoadingOverlay from '../../common/LoadingOverlay'
import PrintDialogContentStyles from './PrintDialogContentStyles'
import { drawerWidth } from '../common/frame/components/Drawer.styles'
import ButtonGroup from '@mui/material/ButtonGroup';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Popover from '@mui/material/Popover';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import LinearProgress from '@mui/material/LinearProgress';

const hideFeatureStubs = true;

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
  isUploading,
  machine,
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
}) => {
  const classes = PrintDialogContentStyles()

  const printFileIndex = printFiles.indexOf(printFile);

  const [data, setData] = useState({
    size: 0,
    topLayer: 100,
    layer: 100,
  });
  const [popover, setPopover] = useState({
    mode: null, // One of rotate, scale, move or mirror
    el: null,
  });

  const {
    size,
    layer,
  } = data;

  const webGLContainer = useRef()


  const rendererAsync = useAsync(async () => {
    const machineDimensions = [235, 235, 255]
    const {
      infiniteZ
    } = machine

    await initSlicerRender();

    const nextRenderer = start({
      machineDimensions,
      infiniteZ,
    });

    return nextRenderer;
  }, [])

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

      if (!forceLoad && modelArrayBuffer.byteLength > 80 * MB) {
        return;
      }

      const modelByteArray = new Uint8Array(modelArrayBuffer.slice(0));

      // console.log({ infiniteZ, machine }, modelArrayBuffer.byteLength)

      renderer.addModel(
        printFile.name,
        modelByteArray,
      );
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
      })
    }
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
          className={classes.largeFileMessage}
        >
          GCode preview disabled for large file (
          {(size / (1 * MB)).toFixed(1)}
          MB)
          <Button
            variant="contained"
            onClick={() => printFileLoader.execute(true)}
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
              orientation="vertical"
              max={data.topLayer}
              disabled={printFile.gcodeVersion == null}
              value={layer}
              onChange={(e, val: number) => {
                setData((data) => ({
                  ...data,
                  layer: val,
                }));
                renderer.send({ setLayer: val });
              }}
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
              disabled={!printFile.isMesh}
              aria-label="3d model manipulation"
              sx={{
                ml: -4,
                "& .MuiButton-root": {
                  pl: 3,
                  pr: 1,
                },
              }}
            >
              <Button
                aria-label="rotate"
                size="large"
                aria-describedby="rotatePopover"
                onClick={(e) => setPopover({ mode: 'rotate', el: e.currentTarget })}
              >
                <ThreeSixtyIcon/>
              </Button>
              <Popover
                id="rotatePopover"
                open={popover.mode === 'rotate'}
                anchorEl={popover.el}
                onClose={() => setPopover((p) =>
                  p.mode === 'rotate' ? { mode: null, el: null } : p
                )}
                anchorOrigin={{
                  horizontal: 'right',
                  vertical: 'center',
                }}
                transformOrigin={{
                  horizontal: 'left',
                  vertical: 'center',
                }}
              >
                <Box sx={{
                  m: 2,
                }}>
                  {['x', 'y', 'z'].map((axis) => (
                    <TextField
                      key={axis}
                      label={`Rotation about ${axis.toUpperCase()}`}
                      size="small"
                      type="number"
                      defaultValue={0}
                      sx={{
                        display: 'block',
                        width: 200,
                        mt: 2,
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            Degrees
                          </InputAdornment>
                        ),
                      }}
                    />
                  ))}
                </Box>
              </Popover>
              <Button
                aria-label="scale"
                size="large"
                aria-describedby="scalePopover"
                onClick={(e) => setPopover({ mode: 'scale', el: e.currentTarget })}
              >
                <PhotoSizeSelectSmallIcon/>
              </Button>
              <Popover
                id="scalePopover"
                open={popover.mode === 'scale'}
                anchorEl={popover.el}
                onClose={() => setPopover((p) =>
                  p.mode === 'scale' ? { mode: null, el: null } : p
                )}
                anchorOrigin={{
                  horizontal: 'right',
                  vertical: 'center',
                }}
                transformOrigin={{
                  horizontal: 'left',
                  vertical: 'center',
                }}
              >
                <Box sx={{
                  m: 2,
                }}>
                  {['x', 'y', 'z'].map((axis) => (
                    <Box key={axis} sx={{ mt: 2 }}>
                      <TextField
                        label={axis.toUpperCase()}
                        size="small"
                        type="number"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              mm
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          width: 150,
                          mr: 2,
                        }}
                      />
                      <TextField
                        label={axis.toUpperCase()}
                        size="small"
                        type="number"
                        defaultValue={100}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              %
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          width: 150,
                        }}
                      />
                    </Box>
                  ))}
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Scale All Axes Together"
                  />
                </Box>
              </Popover>
              <Button
                aria-label="mirror"
                size="large"
                aria-describedby="mirrorPopover"
                onClick={(e) => setPopover({ mode: 'mirror', el: e.currentTarget })}
              >
                <FlipIcon/>
              </Button>
              <Popover
                id="mirrorPopover"
                open={popover.mode === 'mirror'}
                anchorEl={popover.el}
                onClose={() => setPopover((p) =>
                  p.mode === 'mirror' ? { mode: null, el: null } : p
                )}
                anchorOrigin={{
                  horizontal: 'right',
                  vertical: 'center',
                }}
                transformOrigin={{
                  horizontal: 'left',
                  vertical: 'center',
                }}
              >
                <Box sx={{
                  m: 2,
                }}>
                  <ButtonGroup orientation="vertical">
                    {['x', 'y', 'z'].map((axis) => (
                      <Button
                        key={axis}
                      >
                        Flip on {axis.toUpperCase()}
                      </Button>
                    ))}
                  </ButtonGroup>
                </Box>
              </Popover>
              <Button
                aria-label="move"
                size="large"
                aria-describedby="movePopover"
                onClick={(e) => setPopover({ mode: 'move', el: e.currentTarget })}
              >
                <Moving/>
              </Button>
              <Popover
                id="movePopover"
                open={popover.mode === 'move'}
                anchorEl={popover.el}
                onClose={() => setPopover((p) =>
                  p.mode === 'move' ? { mode: null, el: null } : p
                )}
                anchorOrigin={{
                  horizontal: 'right',
                  vertical: 'center',
                }}
                transformOrigin={{
                  horizontal: 'left',
                  vertical: 'center',
                }}
              >
                <Box sx={{
                  m: 2,
                }}>
                  {['x', 'y', 'z'].map((axis) => (
                    <TextField
                      key={axis}
                      label={axis.toUpperCase()}
                      size="small"
                      type="number"
                      defaultValue={0}
                      sx={{
                        display: 'block',
                        width: 150,
                        mt: 2,
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            mm
                          </InputAdornment>
                        ),
                      }}
                    />
                  ))}
                </Box>
              </Popover>
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
            <Button
              variant="outlined"
              onClick={() => slice(printFile)}
              disabled={
                loading || printFile.meshVersion === printFile.gcodeVersion || isMutationPending
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
      </Box>
    </Box>
  )
}

export default PrintView
