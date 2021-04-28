import React, { useState, useCallback } from 'react'
import { Controller, useForm } from 'react-hook-form'
import truncate from 'truncate'

import Typography from '@material-ui/core/Typography'
// import Fab from '@material-ui/core/Fab'
import Tooltip from '@material-ui/core/Tooltip'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'

import Add from '@material-ui/icons/Add'
import PlayArrow from '@material-ui/icons/PlayArrow'
import CloudUpload from '@material-ui/icons/CloudUpload'
// import LowPriority from '@material-ui/icons/LowPriority'
import Star from '@material-ui/icons/Star'
import StarOutline from '@material-ui/icons/StarOutline'

import useConfirm from '../../common/_hooks/useConfirm'
// import FloatingPrintNextButton from './components/FloatingPrintNextButton'
import useStyles from './Starred.styles'

const JobQueueView = ({
  printQueues,
  machines,
  nextPart,
  print,
  printNext,
  printMutation,
  deleteParts,
  history,
}) => {
  const classes = useStyles()

  // console.log({ printQueues })
  const parts = printQueues.map(q => q.parts).flat()

  const statuses = machines.map(machine => machine.status)
  const disablePrintNextButton = (
    nextPart == null
    || !statuses.includes('READY')
    || printMutation.loading
  )

  const [printDialogFiles, setPrintDialogFiles] = useState()
  const [isDragging, setDragging] = useState(false)

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
  const confirmedDeleteParts = confirm(() => ({
    fn: async () => {
      await deleteParts({
        variables: {
          input: {
            partIDs: selectedParts,
          },
        },
      })
      resetSelection()
    },
    title: (
      'Are you sure you want to delete '
      + (selectedParts.length > 1 ? `these ${selectedParts.length} parts?` : 'this part?')
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
            color="default"
            disabled={selectedParts.length === 0}
            startIcon={<Add/>}
          >
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
            color="primary"
            disabled={disablePrintNextButton || selectedParts.length !== 1}
            onClick={() => {
              if (selectedParts.length === 1) {
                print({ id: selectedParts[0] })
              } else {
                printNext()
              }
            }}
            startIcon={<PlayArrow/>}
          >
            {`Print Selected (${selectedParts.length})`}
          </Button>
        </Tooltip>
      </div>

      <div
        className={[
          parts.length === 0 ? classes.draggingOrEmpty : '',
        ].join(' ')}
      >
        { parts.length === 0 && (
          <div className={classes.dragArea}>
            {/* <CloudUpload className={classes.dragIcon} /> */}
            <label
              className={classes.dragLabel}
            >
              <CloudUpload className={classes.dragIcon}/>
              <Typography
                variant="h6"
                className={classes.dragText}
                component="div"
              >
                You have no starred parts. Add a star to a print to save it for later reprinting.
              </Typography>
            </label>
          </div>
        )}

        { !isDragging && printQueues.filter(q => q.parts.length > 0).map(printQueue => (
            <Paper key={printQueue.id}>
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
                                  onClick={confirmedDeleteParts}
                                  edge="start"
                                >
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
                        printQueue.parts.map(part => {
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
                                    { part.saved || true && (
                                      <IconButton aria-label="Unsave" edge="start">
                                        <Star
                                          className={classes.savedStar}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                          }}
                                        />
                                      </IconButton>
                                    )}
                                    { !part.saved && false && (
                                      <IconButton aria-label="Save" edge="start">
                                        <StarOutline
                                          className={classes.UnsavedStarOutline}
                                          onClick={(e) => {
                                            e.stopPropagation()
                                          }}
                                        />
                                      </IconButton>
                                    )}
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
                          )
                        })
                      }
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </Paper>
        ))}
      </div>

      {/* <MobileButtons /> */}
    </div>
  )
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
