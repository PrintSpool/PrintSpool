import React from 'react'
import { compose } from 'recompose'

import {
  Typography,
  CircularProgress,
  Modal,
} from '@material-ui/core'

import FullscreenProgress from '../../shared/components/FullscreenProgress'

import addJobHandler from '../mutations/addJobHandler'
import spoolNextPrintHandler from '../mutations/spoolNextPrintHandler'
import cancelTaskHandler from '../mutations/cancelTaskHandler'
import deleteJobHandler from '../mutations/deleteJobHandler'

import FloatingAddJobButton from './FloatingAddJobButton'
import FloatingPrintNextButton from './FloatingPrintNextButton'
import JobCard from './JobCard'

const enhance = compose(
  addJobHandler,
  spoolNextPrintHandler,
  cancelTaskHandler,
  deleteJobHandler,
)

const JobSubList = ({
  jobs, title, cancelTask, deleteJob,
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
  isUploadingJob,
  addJob,
  spoolNextPrint,
  cancelTask,
  deleteJob,
}) => {
  const statuses = printers.map(printer => printer.status)
  const disablePrintNextButton = statuses.includes('READY') === false

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
      <Modal
        aria-labelledby="uploading-print-job-modal"
        open={isUploadingJob}
      >
        <FullscreenProgress>
          <span id="uploading-print-job-modal">Uploading Job...</span>
        </FullscreenProgress>
      </Modal>
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

      <FloatingAddJobButton onChange={addJob} />
      <FloatingPrintNextButton
        disabled={disablePrintNextButton}
        onClick={spoolNextPrint}
      />
    </div>
  )
}

export const Component = JobList
export default enhance(JobList)
