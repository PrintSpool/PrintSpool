import React from 'react'

import {
  Typography,
} from '@material-ui/core'

import FloatingAddJobButton from '../printButton/FloatingAddJobButton'
import FloatingPrintNextButton from './components/FloatingPrintNextButton'
import JobCard from './components/JobCard'
import useStyles from './JobQueue.styles'

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
      {
        jobs.length === 0
        && (
        <div className={classes.emptyQueueContainer}>
          <Typography variant="h4" className={classes.emptyQueueText}>
            the print queue is empty
          </Typography>
        </div>
        )
      }
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

      <FloatingAddJobButton href="print/" />
      <FloatingPrintNextButton
        disabled={disablePrintNextButton}
        onClick={spoolNextPrint}
      />
    </div>
  )
}

export default JobQueueView
