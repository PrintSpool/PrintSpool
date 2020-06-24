import React, { useState } from 'react'

import Typography from '@material-ui/core/Typography'
import Fab from '@material-ui/core/Fab'
import Tooltip from '@material-ui/core/Tooltip'

import Add from '@material-ui/icons/Add'

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

  return (
    <div className={classes.root}>
      { printDialogFiles && (
        <React.Suspense fallback={<div />}>
          <PrintDialog
            files={printDialogFiles}
            onClose={() => setPrintDialogFiles(null)}
          />
        </React.Suspense>
      )}

      { jobs.length === 0 && (
        <div className={classes.emptyQueueContainer}>
          <Typography variant="h4" className={classes.emptyQueueText}>
            the print queue is empty
          </Typography>
        </div>
      )}
      {
        categories.map(({ title, jobsSubset }) => {
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
