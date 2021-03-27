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
import LowPriorityIcon from '@material-ui/icons/LowPriority'

import useConfirm from '../../common/_hooks/useConfirm'
import FileInput from '../../common/FileInput'
// import FloatingPrintNextButton from './components/FloatingPrintNextButton'
import useStyles from './JobQueue.styles'
import PrintDialog from '../printDialog/PrintDialog'
import PrintCard from './components/PrintCard'

const JobQueueView = ({
  latestPrints,
  printQueues,
  machines,
  nextPart,
  print,
  printNext,
  printMutation,
  deleteParts,
  cancelTask,
  pausePrint,
  resumePrint,
  setPartPositions,
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
    setValue,
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

  const moveToTopOfQueue = () => {
    setPartPositions({
      variables: {
        input: {
          // Use the parts list so that they are ordered by their current position.
          // This matters for bulk moves - without this the order within the moved parts would
          // not be consistent with their previous visual order.
          parts: parts
            .filter(part => selectedPartsObj[part.id])
            .map((part, index) => ({
              partID: part.id,
              position: index,
            })),
        },
      },
    })
  }

  const onDragOver = useCallback((ev) => {
    setDragging(true)

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault()
  }, [])

  const onDragLeave = useCallback((ev) => {
    setDragging(false)
  }, [])

  const onDrop = useCallback((ev) => {
    setDragging(false)

    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault()

    let files
    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      files = [...ev.dataTransfer.items]
        .map((item) => item.getAsFile())
        .filter(item => item != null)
    } else {
      files = [...ev.dataTransfer.files]
    }

    if (files.length > 0) {
      setPrintDialogFiles(files)
    }
  }, [])

  // console.log({ isDragging })
  // console.log(selectedParts.length)

  return (
    <div
      className={classes.root}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      { printDialogFiles && (
        <React.Suspense fallback={<div />}>
          <PrintDialog
            printQueues={printQueues}
            machines={machines}
            files={printDialogFiles}
            onClose={() => setPrintDialogFiles(null)}
          />
        </React.Suspense>
      )}

      <div className={classes.latestPrints}>
        {/* <Typography variant="subtitle1" gutterBottom>
          Latest Print
        </Typography> */}
        { latestPrints.map(print => (
          <PrintCard {...{
            key: print.id,
            print,
            cancelTask,
            pausePrint,
            resumePrint,
            deleteParts,
          }} />
        ))}
      </div>

      {/* Actions Row */}
      <div>
        <Button
          component="label"
          variant="outlined"
          className={classes.actionsRowButton}
          color="default"
          startIcon={<Add/>}
        >
          <FileInput
            accept=".ngc,.gcode"
            onClick={setPrintDialogFiles}
          />
          Add
        </Button>
        <Button
          component="label"
          variant="contained"
          className={classes.actionsRowButton}
          color="primary"
          disabled={disablePrintNextButton}
          onClick={printNext}
          startIcon={<PlayArrow/>}
        >
          Print Next
        </Button>
      </div>

      <div
        className={[
          (isDragging || parts.length === 0) ? classes.draggingOrEmpty : '',
          isDragging ? classes.dragging : '',
        ].join(' ')}
      >
        { (isDragging || parts.length === 0) && (
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
                {!isDragging && (
                  <>
                    Your print queue is empty. Drag and drop a gcode file here to get started!
                    <FileInput
                      accept=".ngc,.gcode"
                      onClick={setPrintDialogFiles}
                    />
                  </>
                )}
                {isDragging && (
                  'Drop your gcode file here!'
                )}
              </Typography>
              {/* <Typography
                variant="h6"
                component="div"
                // className={classes.dragText}
                paragraph
              >
                Or
              </Typography>
              <Button
                className={classes.chooseAFileButton}
                component="label"
                variant="contained"
                color="primary"
              >
                Select Files
                <FileInput
                  accept=".ngc,.gcode"
                  onClick={setPrintDialogFiles}
                />
              </Button> */}
            </label>
          </div>
        )}

        { !isDragging && printQueues.filter(q => q.parts.length > 0).map(printQueue => (
            <Paper key={printQueue.id}>
              <div className={classes.partsList}>
                <TableContainer>
                  <Table
                    size="medium"
                    aria-label={ printQueue.name }
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
                        <TableCell padding="none">
                          { selectedParts.length > 0 && (
                            <>
                              <Tooltip title="Print Selected">
                                <IconButton
                                  aria-label="print-selected"
                                  onClick={() => {
                                    print({ id: selectedParts[0] })
                                  }}
                                  edge="start"
                                  disabled={ disablePrintNextButton || selectedParts.length !== 1}
                                >
                                  <PlayArrow />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Move to Top of Queue">
                                <IconButton
                                  aria-label="move to top of queue"
                                  onClick={moveToTopOfQueue}
                                  edge="start"
                                  style={{ transform: 'scaleX(-1) scaleY(-1)' }}
                                >
                                  <LowPriorityIcon />
                                </IconButton>
                              </Tooltip>
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
                        <TableCell colSpan={2}>
                          <Typography
                            variant="h5"
                            component="div"
                          >
                            { printQueue.name }
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
                                  onClick={() => {
                                    history.push(`./printing/${part.id}/`)
                                  }}
                                  selected={checkboxProps.value}
                                  style={{ cursor: 'pointer' }}
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
                                  <TableCell
                                    component="th"
                                    id={labelID}
                                    scope="row"
                                    padding="none"
                                  >
                                    <Typography display="inline">
                                      {shortName}
                                    </Typography>
                                    <Typography
                                      display="inline"
                                      className={classes.qty}
                                    >
                                      {`${part.printsCompleted} / ${part.totalPrints} `}
                                      printed
                                    </Typography>
                                    { part.printsInProgress > 0 && (
                                      <Typography color="primary" display="inline">
                                        {`${part.printsInProgress} printing`}
                                      </Typography>
                                    )}
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
