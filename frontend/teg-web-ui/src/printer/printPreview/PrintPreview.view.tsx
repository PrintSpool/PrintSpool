import React from 'react'

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

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import ServerBreadcrumbs from '../common/ServerBreadcrumbs';
import EditButtonsDesktopView from './EditButtons.desktop.view';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';

import CameraPositionButtons from './CameraPositionButtons.view';
import AllPartsView from './AllParts.view';

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
            page={item.page < 2 ? 'All Parts' : item.page - 1}
          />
        )
      }}
    />
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
            zIndex: 2,
            position: 'relative',
          }}
        >
          <Typography color="textPrimary">Print Preview</Typography>
        </ServerBreadcrumbs>
        <Box
          sx={{
          }}
        >
          <Typography
            variant="h1"
            sx={{
              mt: 1,
              zIndex: 2,
              position: 'relative',
              display: {
                xs:  printFileIndex == -1 ? 'block' : 'none',
                md: 'none',
              },
            }}
          >
            { printFileIndex >= 0 && printFile.name }
            { printFileIndex == -1 &&
              `Previewing ${printFiles.length} Part${printFiles.length === 1 ? '' : 's'}`
            }
          </Typography>

          { printFileIndex >= 0 && (
            <Box
              sx={{
                mt: 1,
                mb: 2,
                ml: -1,
                zIndex: 2,
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
        <CameraPositionButtons renderer={renderer} />
      )}

      {/* Mobile Pagination */}
      { printFile != null && (
        <Box
          sx={{
            zIndex: 2,
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

      {/* Preview / Print Buttons */}
      <Paper sx={{
        mt: 2,
        mb: 2,
        ml: 1,
        mr: 1,
        p: 2,
        zIndex: 2,
        gridColumn: 'main',
        gridRow: 'print',
        justifySelf: {
          xs: 'stretch',
          md: 'end',
        },
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
        { printFile != null && printFile.meshVersion === printFile.gcodeVersion && printFile.isMesh &&
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
          disabled={loading || isMutationPending}
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
  )
}

export default PrintPreview
