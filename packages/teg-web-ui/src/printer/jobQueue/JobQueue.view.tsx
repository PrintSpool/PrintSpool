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
  jobs,
  machines,
  spoolNextPrint,
  deleteJob,
  cancelTask,
  moveToTopOfQueue,
}) => {
  const classes = useStyles()

  const statuses = machines.map(machine => machine.status)
  const disablePrintNextButton = (
    statuses.includes('READY') === false
    || jobs.every(job => job.files.every(jobFile => jobFile.printsQueued === 0))
  )

  const [printDialogFiles, setPrintDialogFiles] = useState()
  const [isDragging, setDragging] = useState(false)

  // TODO: recreate job status with a more limited scope
  const categories = [
    {
      title: 'Done',
      jobsSubset: jobs.filter(job => job.isDone),
    },
    {
      title: 'Printing',
      jobsSubset: jobs.filter((job) => {
        const currentTasks = job.tasks.filter(task => (
          ['CANCELLED', 'ERROR'].includes(task.status) === false
        ))
        return !job.isDone && currentTasks.length > 0
      }),
    },
    {
      title: 'Queued',
      jobsSubset: jobs.filter((job) => {
        const currentTasks = job.tasks.filter(task => (
          ['CANCELLED', 'ERROR'].includes(task.status) === false
        ))
        return !job.isDone && currentTasks.length === 0
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

    setPrintDialogFiles(files)
  }, [])

  console.log({ isDragging })

  return (
    <div
      className={[
        classes.root,
        (isDragging || jobs.length === 0) ? classes.draggingOrEmpty : '',
        isDragging ? classes.dragging : '',
      ].join(' ')}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      { printDialogFiles && (
        <React.Suspense fallback={<div />}>
          <PrintDialog
            files={printDialogFiles}
            onClose={() => setPrintDialogFiles(null)}
          />
        </React.Suspense>
      )}

      { (isDragging || jobs.length === 0) && (
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
        !isDragging && categories.map(({ title, jobsSubset }) => {
          if (jobsSubset.length === 0) return <div key={title} />

          return (
            <div key={title}>
              <Typography variant="subtitle1" gutterBottom>
                { title }
              </Typography>
              {
                jobsSubset.map(job => (
                  <div key={job.id} className={classes.jobContainer}>
                    <JobCard
                      {...job}
                      cancelTask={cancelTask}
                      deleteJob={deleteJob}
                      moveToTopOfQueue={moveToTopOfQueue}
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
