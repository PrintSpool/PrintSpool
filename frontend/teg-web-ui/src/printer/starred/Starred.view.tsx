import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import truncate from 'truncate'

import Typography from '@mui/material/Typography'
// import Fab from '@mui/material/Fab'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'

import Add from '@mui/icons-material/Add'
import PlayArrow from '@mui/icons-material/PlayArrow'
// import LowPriority from '@mui/icons-material/LowPriority'
import Star from '@mui/icons-material/Star'
import StarOutline from '@mui/icons-material/StarOutline'

import useConfirm from '../../common/_hooks/useConfirm'
// import FloatingPrintNextButton from './components/FloatingPrintNextButton'
import useStyles from './Starred.styles'
import ServerBreadcrumbs from '../common/ServerBreadcrumbs'

const JobQueueView = ({
  printQueues,
  machines,
  print,
  printMutation,
  deletePackages,
  setStarred,
  addToQueue,
}) => {
  const classes = useStyles()

  // console.log({ printQueues })
  const parts = printQueues.map(q => q.parts).flat()

  parts.sort((a, b) => {
    if (a.name < b.name) {
      return -1
    } else if (a.name > b.name) {
      return 1
    } else if (a.createdAt < b.createdAt) {
      return -1
    } else {
      return 1
    }
  })

  const defaultValues = () => ({
    selectedParts: Object.fromEntries(parts.map(part => ([
      part.id,
      false,
    ])))
  })

  const {
    // register,
    watch,
    reset,
    control,
    getValues,
    // setValue,
  } = useForm({
    defaultValues: defaultValues(),
  })

  const selectedPartsObj = watch('selectedParts', {})
  const selectedParts = Object.entries(selectedPartsObj)
    .filter(([, v]) => v)
    .map(([k]) => k)

  // console.log(selectedParts)

  const statuses = machines.map(machine => machine.status)
  const disablePrintButton = (
    !statuses.includes('READY')
    || printMutation.loading
    || selectedParts.length !== 1
  )

  const resetSelection = () => {
    // console.log('reset selected parts')
    reset({
      ...getValues(),
      selectedParts: defaultValues().selectedParts,
    })
  }

  const onSelectAllClick = (e) => {
    if (e.target.checked && selectedParts.length === 0) {
      reset({
        ...getValues(),
        selectedParts: Object.fromEntries(parts.map(part => [part.id, true])),
      })
    } else {
      resetSelection()
    }
  }

  const confirm = useConfirm()
  const confirmedDeletePackages = confirm(() => ({
    fn: async () => {
      await deletePackages({
        variables: {
          input: {
            packageIDs: parts
              .filter(part => selectedParts.includes(part.id))
              .map(part => part.packageID),
          },
        },
      })
      resetSelection()
    },
    title: (
      'Are you sure you want to delete '
      + (
          selectedParts.length > 1 ?
          `these ${selectedParts.length} starred parts?`
          :
          'this starred part?'
        )
    ),
    description: selectedParts.map(id => (
      <React.Fragment key={id}>
        {parts.find(p => p.id == id).name}
        <br/>
      </React.Fragment>
    ))
  }))

  let printButtonTooltip = ''
  if (selectedParts.length === 0) {
    printButtonTooltip = 'Select a part to print'
  } else if (!statuses.includes('READY')) {
    printButtonTooltip = `Cannot print when machine is ${statuses[0].toLowerCase()}`
  } else if (printMutation.loading) {
    printButtonTooltip = "Starting print..."
  } else if (selectedParts.length > 1) {
    printButtonTooltip = "Cannot print more then 1 part at a time"
  }


  return (
    <div
      className={classes.root}
    >
      <ServerBreadcrumbs machineName={machines[0].name}>
        <Typography color="textPrimary">Starred Prints</Typography>
      </ServerBreadcrumbs>

      {/* Actions Row */}
      <div>
        <Tooltip title={selectedParts.length === 0 ? 'Select a part' : ''}>
          <Button
            style={{
              pointerEvents: "auto",
            }}
            component="label"
            variant="outlined"
            className={classes.actionsRowButton}
            onClick={() => {
              addToQueue({
                variables: {
                  input: {
                    packageIDs: parts
                      .filter(part => selectedPartsObj[part.id])
                      .map((part) => part.packageID),
                  },
                },
              })
            }}
            disabled={selectedParts.length === 0}
            startIcon={<Add/>}>
            {`Add to Queue (${selectedParts.length})`}
          </Button>
        </Tooltip>
        <Tooltip title={printButtonTooltip}>
          <Button
            style={{
              pointerEvents: "auto",
            }}
            component="div"
            variant="contained"
            className={classes.actionsRowButton}
            disabled={disablePrintButton}
            onClick={() => {
                print(parts.find(part => part.id === selectedParts[0]))
            }}
            startIcon={<PlayArrow/>}
          >
            {`Print Selected (${selectedParts.length})`}
          </Button>
        </Tooltip>
      </div>

      { parts.length === 0 && (
        <div className={classes.noStars}>
          <Typography
            variant="h6"
            className={classes.noStarsText}
            component="div"
          >
            No starred parts!
          </Typography>
          <Typography
            variant="subtitle1"
            // className={classes.noStarsSubtitle}
            component="div"
          >
            Star a part in a print queue to save it for printing later.
          </Typography>
        </div>
      )}

      { parts.length > 0 && (
        <div>
          <Paper>
            <div className={classes.partsList}>
              <TableContainer>
                <Table
                  size="medium"
                  aria-label="Starred Parts"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox" className={classes.headerCheckbox}>
                        <Checkbox
                          indeterminate={
                            selectedParts.length > 0
                            && selectedParts.length < parts.length
                          }
                          checked={
                            selectedParts.length > 0
                            && selectedParts.length === parts.length
                          }
                          onChange={onSelectAllClick}
                          inputProps={{ 'aria-label': 'select all parts' }}
                        />
                      </TableCell>
                      <TableCell padding="none" colSpan={2}>
                        { selectedParts.length > 0 && (
                          <>
                            <Tooltip title="Delete">
                              <IconButton
                                aria-label="delete"
                                onClick={confirmedDeletePackages}
                                edge="start"
                                size="large">
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography
                          variant="h5"
                          component="div"
                        >
                          Starred Parts
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      parts.map(part => {
                        const labelID = `${part.id}-label`
                        const shortName = truncate(part.name, 32)

                        return (
                          <Controller
                            key={part.id}
                            name={`selectedParts.${part.id}`}
                            control={control}
                            defaultValue={false}
                            render={(checkboxProps) => (
                              <TableRow
                                hover
                                // onClick={(event) => handleClick(event, row.name)}
                                // role="checkbox"
                                // aria-checked={isItemSelected}
                                tabIndex={-1}
                                // onClick={() => {
                                //   history.push(`./printing/${part.id}/`)
                                // }}
                                selected={checkboxProps.value}
                                // style={{ cursor: 'pointer' }}
                                style={{ cursor: 'default' }}
                                // selected={isItemSelected}
                              >
                                <TableCell padding="checkbox">
                                  <Checkbox
                                    checked={checkboxProps.value || false}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                    }}
                                    onChange={(e) => {
                                      // console.log('on change', selectedPartsObj)
                                      // @ts-ignore
                                      checkboxProps.onChange(e.target.checked)
                                    }}
                                    // size="small"
                                    // inputProps={{ 'aria-labelledby': labelId }}
                                  />
                                </TableCell>
                                <TableCell padding="checkbox" className={classes.savedCell}>
                                  <IconButton
                                    aria-label={part.starred ? 'Unsave' : 'Save'}
                                    edge="start"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      console.log({
                                        variables: {
                                          input: {
                                            packageID: part.packageID,
                                            starred: !part.starred,
                                          },
                                        },
                                      })
                                      setStarred({
                                        variables: {
                                          input: {
                                            packageID: part.packageID,
                                            starred: !part.starred,
                                          },
                                        },
                                      })
                                    }}
                                    size="large">
                                    { part.starred && (
                                      <Star className={classes.savedStar} />
                                    )}
                                    { !part.starred && (
                                      <StarOutline className={classes.UnsavedStarOutline} />
                                    )}
                                  </IconButton>
                                </TableCell>
                                <TableCell
                                  component="th"
                                  id={labelID}
                                  scope="row"
                                  padding="none"
                                >
                                  <Typography display="inline">
                                    {shortName}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          />
                        );
                      })
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Paper>
        </div>
      )}
    </div>
  );
}

// const MobileButtons = (
//   <>
//     {/* Add Job Button */}
//     <Tooltip title="Add Job" placement="left">
//       <Fab
//         component="label"
//         variant="extended"
//         className={classes.addJobFab}
//         color="default"
//       >
//         <FileInput
//           accept=".ngc,.gcode"
//           onClick={setPrintDialogFiles}
//         />
//         <Add className={ classes.fabIconExtended }/>
//         Add
//       </Fab>
//     </Tooltip>
//     {/* Print Next Button */}
//     <FloatingPrintNextButton
//       disabled={disablePrintNextButton}
//       onClick={printNext}
//     />
//   </>
// )

export default JobQueueView
