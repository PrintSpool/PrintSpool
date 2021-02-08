import React, { useState, useCallback } from 'react'

import Typography from '@material-ui/core/Typography'
import Fab from '@material-ui/core/Fab'
import Tooltip from '@material-ui/core/Tooltip'
import Button from '@material-ui/core/Button'

import Add from '@material-ui/icons/Add'
import MoveToInbox from '@material-ui/icons/MoveToInbox'

import FileInput from '../../common/FileInput'
import FloatingPrintNextButton from './components/FloatingPrintNextButton'
import JobCard from './components/JobCard'
import useStyles from './JobQueue.styles'
import PrintDialog from '../printDialog/PrintDialog'

const JobQueueView = ({
  printQueues,
  machines,
  nextPart,
  spoolNextPrint,
  deleteJob,
  cancelTask,
  pausePrint,
  resumePrint,
  moveToTopOfQueue,
}) => {
  const classes = useStyles()

  console.log({ printQueues })
  const parts = printQueues.map(q => q.parts).flat()

  const statuses = machines.map(machine => machine.status)
  const disablePrintNextButton = nextPart == null

  const [printDialogFiles, setPrintDialogFiles] = useState()
  const [isDragging, setDragging] = useState(false)

  // TODO: recreate job status with a more limited scope
  const categories = [
    {
      title: 'Done',
      partsSubset: parts.filter(part => part.startedFinalPrint),
    },
    {
      title: 'Printing',
      partsSubset: parts.filter((part) => {
        const currentTasks = part.tasks.filter(task => (
          ['CANCELLED', 'ERROR'].includes(task.status) === false
        ))
        return !part.startedFinalPrint && currentTasks.length > 0
      }),
    },
    {
      title: 'Queued',
      partsSubset: parts.filter((part) => {
        const currentTasks = part.tasks.filter(task => (
          ['CANCELLED', 'ERROR'].includes(task.status) === false
        ))
        return !part.startedFinalPrint && currentTasks.length === 0
      }),
    },
  ]


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

  return (
    <div
      className={[
        classes.root,
        (isDragging || parts.length === 0) ? classes.draggingOrEmpty : '',
        isDragging ? classes.dragging : '',
      ].join(' ')}
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

      { (isDragging || parts.length === 0) && (
        <div className={classes.dragArea}>
          <MoveToInbox className={classes.dragIcon} />
          <Typography variant="body2" className={classes.dragText}>
            <Button
              className={classes.chooseAFileButton}
              component="label"
            >
              Choose a file
              <FileInput
                accept=".ngc,.gcode"
                onClick={setPrintDialogFiles}
              />
            </Button>
            or drag it here to print
          </Typography>
        </div>
      )}

      {
        !isDragging && categories.map(({ title, partsSubset }) => {
          if (partsSubset.length === 0) return <div key={title} />

          return (
            <div key={title}>
              <Typography variant="subtitle1" gutterBottom>
                { title }
              </Typography>
              {
                partsSubset.map(part => (
                  <div key={part.id} className={classes.partContainer}>
                    <JobCard
                      {...part}
                      {...{
                        cancelTask,
                        pausePrint,
                        resumePrint,
                        deleteJob,
                        moveToTopOfQueue,
                      }}
                    />
                  </div>
                ))
              }
            </div>
          )
        })
      }

      {/* Add Job Button */}
      <Tooltip title="Add Job" placement="left">
        <Fab
          component="label"
          className={classes.addJobFab}
          color="default"
        >
          <FileInput
            accept=".ngc,.gcode"
            onClick={setPrintDialogFiles}
          />
          <Add />
        </Fab>
      </Tooltip>
      {/* Print Next Button */}
      <FloatingPrintNextButton
        disabled={disablePrintNextButton}
        onClick={spoolNextPrint}
      />
    </div>
  )
}

export default JobQueueView
