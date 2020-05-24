import React from 'react'

import {
  Typography,
} from '@material-ui/core'

import FloatingAddJobButton from '../printButton/FloatingAddJobButton'
import FloatingPrintNextButton from './components/FloatingPrintNextButton'
import JobCard from './components/JobCard'

const JobSubList = ({
  jobs,
  title,
  cancelTask,
  deleteJob,
}) => {
  if (jobs.length === 0) return <div />
  return (
    <div>
      <Typography variant="subtitle1" gutterBottom>
        { title }
      </Typography>
      {
        jobs.map(job => (
          <div key={job.id} style={{ marginBottom: 24 }}>
            <JobCard
              {...job}
              cancelTask={cancelTask}
              deleteJob={deleteJob}
            />
          </div>
        ))
      }
    </div>
  )
}

const JobQueueView = ({
  jobs,
  machines,
  spoolNextPrint,
  deleteJob,
  cancelTask,
}) => {
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
      jobsSubset: jobs.filter(job => !job.isDone && job.tasks.length > 0),
    },
    {
      title: 'Queued',
      jobsSubset: jobs.filter(job => !job.isDone && job.tasks.length === 0),
    },
  ]

  return (
    <div>
      {
        jobs.length === 0
        && (
        <div
          style={{
            position: 'relative',
            top: '12vh',
            height: '50vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h4" style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
            the print queue is empty
          </Typography>
        </div>
        )
      }
      {
        categories.map(({ title, jobsSubset }) => (
          <JobSubList
            key={title}
            title={title}
            jobs={jobsSubset}
            cancelTask={cancelTask}
            deleteJob={deleteJob}
          />
        ))
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
