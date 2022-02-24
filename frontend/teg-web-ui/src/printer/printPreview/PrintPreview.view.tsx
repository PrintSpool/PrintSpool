import React, { useEffect, useState } from 'react'
import { Route, Link, useRouteMatch, useParams, useHistory } from 'react-router-dom';

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import LinearProgress from '@mui/material/LinearProgress';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import BottomNavigation from '@mui/material/BottomNavigation';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LayersIcon from '@mui/icons-material/Layers';
import LayersClearIcon from '@mui/icons-material/LayersClear';
import EditIcon from '@mui/icons-material/CropRotate';
import SettingsIcon from '@mui/icons-material/Tune';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import ServerBreadcrumbs from '../common/ServerBreadcrumbs';
import EditButtonsDesktopView from './EditButtons.desktop.view';
import CameraPositionButtons from './CameraPositionButtons.view';
import AllPartsView from './AllParts.view';
import useConfirm from '../../common/_hooks/useConfirm';
import IconButton from '@mui/material/IconButton';
import GCodeLayerSlider from './GCodeLayerSlider.view';
import RotateButtons from './RotateButtons.view';
import ScaleButtons from './ScaleButtons.view';
import MirrorButtons from './MirrorButtons.view';
import MoveButtons from './MoveButtons.view';

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

const PrintPreview = ({
  renderer,
  topLayer,
  viewMode,
  isMutationPending,
  isUploading,
  machine,
  featureFlags,
  slicerEngine,
  printQueues,
  printFiles,
  setPrintFiles,
  printFile,
  printFileIndex,
  setPrintFileIndex,
  addFiles,
  loading,
  setQuantity,
  addToQueue,
  printNow,
  slice,
  sliceMutation,
}) => {
  const { path, url } = useRouteMatch();
  const history = useHistory();

  // Remove the trainling slashes
  const baseURL = url.slice(0, -1);
  const basePath = path.slice(0, -1);

  if (loading) {
    return <div/>
  }

  const pagination = (
    <Pagination
      count={printFiles.length + 1}
      page={printFileIndex + 2}
      onChange={(_e, val) => {
        console.log(val)
        if (val >= 2) {
          setPrintFileIndex(val - 2)
        } else {
          setPrintFileIndex(-1)
        }
      }}
      renderItem={(item) => {
        // if (item.page === 1 && item.type === 'page') {
        //   return <Button>All</Button>
        // }
        return (
          <PaginationItem
            {...item}
            page={item.page < 2 ? 'All' : item.page - 1}
          />
        )
      }}
    />
  )

  const slicingFeedback = (
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
  )

  return (
    <>
      {/* Headers */}
      <Box sx={{
        gridArea: 'hd',
      }}>
        <ServerBreadcrumbs
          machineName={machine.name}
          sx={{
            zIndex: 10,
            position: 'relative',
            display: {
              xs:  'none',
              md: 'block',
            },
          }}
        >
          <Typography color="textPrimary">Print Preview</Typography>
        </ServerBreadcrumbs>

        <Box
          sx={{
            zIndex: 10,
            position: 'relative',
            display: {
              xs: 'block',
              md:  'none',
            },
          }}
        >
          <IconButton
            component={Link}
            to="../"
          >
            <ArrowBackIcon/>
          </IconButton>
        </Box>

        <Box
          sx={{
          }}
        >
          <Typography
            variant="h1"
            sx={{
              mt: 1,
              zIndex: 10,
              position: 'relative',
              display: {
                xs:  printFileIndex == -1 ? 'block' : 'none',
                md: 'block',
              },
            }}
          >
            { printFileIndex >= 0 && printFile.name }
            { printFileIndex == -1 &&
              `Previewing ${printFiles.length} Part${printFiles.length === 1 ? '' : 's'} for Upload`
            }
          </Typography>

          { printFileIndex >= 0 && (
            <Box
              sx={{
                mt: 1,
                mb: 2,
                ml: -1,
                zIndex: 10,
                position: 'relative',
                display: {
                  xs: 'none',
                  md: 'block',
                },
              }}
            >
              {/* Part */}
              { pagination }
            </Box>
          )}

          { printFileIndex === -1 && (
            <AllPartsView {...{
              featureFlags,
              printFiles,
              setPrintFiles,
              setPrintFileIndex,
              addFiles,
            }}/>
          )}

          { printFileIndex >= 0 && (
            <Box
              sx={{
                display: {
                  xs: 'none',
                  md: 'block',
                },
              }}
            >
              <TextField
                label="Print Queue"
                size="small"
                defaultValue={printQueues[0].name}
                sx={{
                  mt: 2,
                  zIndex: 10,
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
                  zIndex: 10,
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
                  zIndex: 10,
                  position: 'relative',
                  display: 'block',
                }}
              />
            </Box>
          )}
        </Box>
      </Box>

      { printFileIndex >= 0 && (
        <>
          <Box sx={{
            gridColumn: 'quality',
            gridRow: 'hd',
            justifySelf: 'right',
            ml: 2,
            mr: 2,
            maxWidth: '60%',
            display: {
              xs: 'none',
              md: hideFeatureStubs ? 'none' : 'block',
            },
          }}>
            <Accordion sx={{
              zIndex: 10,
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

          {/* Editing Buttons (eg. Rotate) */}
          <EditButtonsDesktopView {...{
            key: printFile.id,
            printFile,
            slicerEngine,
            renderer,
          }} />
        </>
      )}

      {/* Camera Positions */}
      { printFile != null && (
        <CameraPositionButtons
          renderer={renderer}
          sx={{
            display: {
              xs: 'none',
              md: 'block',
            },
          }}
        />
      )}

      {/* Mobile Index & Desktop Interface */}
      <Route exact path={path}>
        <>
          {/* Mobile Pagination */}
          { printFile != null && (
            <Box
              sx={{
                zIndex: 10,
                gridColumn: 'main',
                gridRow: 'layer',
                justifySelf: 'center',
                alignSelf: 'end',
                display: {
                  sx: 'inherit',
                  md: 'none',
                }
              }}
            >
              {pagination}
            </Box>
          )}

          {/* Mobile: Index: Click to preview model*/}
          { printFile != null && (
            <Box
              sx={{
                display: {
                  xs: 'block',
                  md: 'none',
                },
                zIndex: 2,
                gridArea: 'main',
                justifySelf: 'stretch',
              }}
              component={Link}
              to={`${baseURL}/${printFile?.id}/`}
            />
          )}

          {/* Desktop: GCode Layer Slider */}
          <GCodeLayerSlider {...{
            topLayer,
            renderer,
            printFile,
            sx: {
              display: {
                xs: 'none',
                md: 'block',
              },
            }
          }} />

          {/* Preview / Print Buttons */}
          <Paper sx={{
            mt: 2,
            mb: 2,
            ml: 1,
            mr: 1,
            p: 2,
            zIndex: 10,
            gridColumn: 'main',
            gridRow: 'print',
            justifySelf: {
              xs: 'stretch',
              md: 'end',
            },
          }}>
            { slicingFeedback }
            { (
              printFile != null
              && printFile.meshVersion === printFile.gcodeVersion
              && printFile.isMesh
            ) &&
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
            { printFile != null && (
              <Button
                variant="outlined"
                onClick={() => slice(printFile)}
                disabled={
                  loading || isMutationPending || printFile.meshVersion === printFile.gcodeVersion
                }
                sx={{
                  mr: 1,
                  display: {
                    xs: 'none',
                    md: 'inline-block',
                  },
                }}
              >
                Preview GCode
              </Button>
            )}
            <Button
              onClick={addToQueue}
              variant="outlined"
              disabled={loading || isMutationPending || printFiles.length === 0}
              sx={{
                mr: 1,
                mb: {
                  xs: 1,
                  md: 0,
                },
                width: {
                  xs: '100%',
                  md: 'inherit',
                },
              }}
            >
              Add ({printFiles.length}) to Queue
            </Button>
            <Button
              onClick={printNow}
              variant="contained"
              disabled={machine?.status !== 'READY' || loading || isMutationPending}
              sx={{
                width: {
                  xs: '100%',
                  md: 'inherit',
                },
              }}
            >
              Print Now
            </Button>
          </Paper>
        </>
      </Route>


      {/* Mobile: Preview: GCode Layer Slider and Camera Position Buttons*/}
      <Route path={`${basePath}/:printFileID/`}>
        <>
          <GCodeLayerSlider {...{
            topLayer,
            renderer,
            printFile,
          }} />
          <CameraPositionButtons renderer={renderer} />
        </>
      </Route>

      {/* Mobile: Preview model*/}
      <Route exact path={`${basePath}/:printFileID/:tab?`} component={() => {
        const { printFileID, tab } = useParams();

        useEffect(() => {
          if (printFileID !== printFile.id) {
            setPrintFileIndex(printFiles.findIndex(p => p.id === printFileID))
          }
        }, [printFileID])

        // The /:printFileID/ route is context dependent showing GGode or the model depending on if
        // the file is a mesh or not (if it's not a mesh there isn't any model to show)
        const tabsOrder = [
          undefined,
          'gcode',
          'edit',
          'settings',
        ]

        console.log(tab, tabsOrder.indexOf(tab))

        // Set the view mode and trigger slicing depending on the tab
        useEffect(() => {
          if (tab === undefined && renderer != null) {
            renderer.send({ setViewMode: 'model' })
          }

          if (tab === 'gcode' && renderer != null) {
            if (isMutationPending || printFile.meshVersion === printFile.gcodeVersion) {
              renderer.send({ setViewMode: 'gcode' })
            } else {
              slice(printFile)
            }
          }
        }, [
          tab,
          printFile.meshVersion,
          printFile.gcodeVersion,
          isMutationPending,
          renderer == null,
        ])

        const confirm = useConfirm()

        const confirmedDelete = confirm(() => {
          return {
            fn: () => {
              history.push(`../`)
              setPrintFileIndex(printFiles.length > 1 ? 0 : -1)
              setPrintFiles(printFiles.filter((p) => p.id !== printFile.id))
            },
            title: `Remove from upload?`,
            description: printFile.name,
          }
        })

        return (
          <Box
            sx={{
              zIndex: 10,
              gridRow: 'ft',
              gridColumn: 'main',
              alignSelf: 'end',
            }}
          >
            { slicingFeedback }
            <BottomNavigation
              // showLabels
              value={printFile.isMesh ? tabsOrder.indexOf(tab) : 1}
            >
              {printFile.isMesh && (
                <BottomNavigationAction
                  label="Model"
                  icon={<LayersClearIcon />}
                  component={Link}
                  to={`${baseURL}/${printFile?.id}/`}
                />
              )}
              <BottomNavigationAction
                label="GCode"
                icon={<LayersIcon />}
                component={Link}
                to={`${baseURL}/${printFile?.id}/${printFile.isMesh ? 'gcode' : ''}`}
              />
              {printFile.isMesh && (
                <BottomNavigationAction
                  key="edit"
                  label="Edit"
                  icon={<EditIcon />}
                  component={Link}
                  to={`${baseURL}/${printFile?.id}/edit/rotate`}
                />
              )}
              {false && printFile.isMesh && (
                <BottomNavigationAction
                  key="profile"
                  label="Profile"
                  icon={<SettingsIcon />}
                  component={Link}
                  to={`${baseURL}/${printFile?.id}/profile/`}
                />
              )}
              <BottomNavigationAction
                label="Delete"
                icon={<DeleteIcon />}
                onClick={confirmedDelete}
              />
            </BottomNavigation>
          </Box>
        )
      }} />

      {/* Mobile: Edit model*/}
      <Route path={`${basePath}/:filename/edit/:action`} component={() => {
        const { action } = useParams();
        const editPath = `${basePath}/:filename/edit`

        const actions = [
          { slug: 'rotate', label: 'Rotate' },
          { slug: 'scale', label: 'Scale' },
          { slug: 'flip', label: 'Flip' },
          { slug: 'move', label: 'Move' },
        ]

        return (
          <Box
            sx={{
              zIndex: 10,
              gridRow: 'ft',
              gridColumn: 'main',
              alignSelf: 'end',
            }}
          >
            <Route exact path={`${editPath}/rotate`}>
              <RotateButtons renderer={renderer} />
            </Route>
            <Route exact path={`${editPath}/scale`}>
              <ScaleButtons renderer={renderer} />
            </Route>
            <Route exact path={`${editPath}/flip`}>
              <MirrorButtons renderer={renderer} />
            </Route>
            <Route exact path={`${editPath}/move`}>
              <MoveButtons renderer={renderer} />
            </Route>

            <Tabs
              value={actions.findIndex(a => a.slug === action)}
              variant="scrollable"
              scrollButtons="auto"
            >
              { actions.map(({ slug, label }) => (
                <Tab
                  key={slug}
                  label={label}
                  component={Link}
                  to={`./${slug || ''}`}
                />
              ))}
            </Tabs>
            {/* <Box
              sx={{ mt: 2 }}
            >
              <Button
                variant="outlined"
                component={Link}
                to="../"
              >
                Back
              </Button>
            </Box> */}
          </Box>
        )
      }} />
    </>
  )
}

export default PrintPreview
