import React from 'react'
import { compose } from 'recompose'

import {
  Typography,
} from '@material-ui/core'

import spoolNextPrintHandler from '../mutations/spoolNextPrintHandler'
import deleteJobHandler from '../mutations/deleteJobHandler'

import useExecGCodes from '../../_hooks/useExecGCodes'

import FloatingAddJobButton from '../../printButton/FloatingAddJobButton'
import FloatingPrintNextButton from './FloatingPrintNextButton'
import JobCard from './JobCard'

const enhance = compose(
  spoolNextPrintHandler,
  deleteJobHandler,
)

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

const JobList = ({
  jobs,
  printers,
  spoolNextPrint,
  deleteJob,
}) => {
  const cancelTask = useExecGCodes(() => ({
    printer: printers[0],
    gcodes: ['estop'],
  }))

  const statuses = printers.map(printer => printer.status)
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
      jobsSubset: jobs.filter(job => job.tasks.length > 0),
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

export const Component = JobList
export default enhance(JobList)
