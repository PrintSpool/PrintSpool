import React from 'react'
import { compose } from 'recompose'
import V from 'voca'

import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Grid,
  IconButton,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  LinearProgress,
  Divider,
} from 'material-ui'

import addJobHandler from './mutations/addJobHandler'
import spoolNextPrintHandler from './mutations/spoolNextPrintHandler'
import cancelTaskHandler from './mutations/cancelTaskHandler'
import deleteJobHandler from './mutations/deleteJobHandler'

import FloatingAddJobButton from './FloatingAddJobButton'
import FloatingPrintNextButton from './FloatingPrintNextButton'
import JobCard from './JobCard'

const enhance = compose(
  addJobHandler,
  spoolNextPrintHandler,
  cancelTaskHandler,
  deleteJobHandler,
)

const JobSubList = ({ jobs, status, cancelTask, deleteJob }) => {
  const filteredJobs = jobs.filter(job => job.status == status)
  if (filteredJobs.length === 0) return <div/>
  return (
    <div>
      <Typography variant="subheading" gutterBottom>
        { V.capitalize(status.toLowerCase()) }
      </Typography>
      {
        filteredJobs.map(job => (
          <div key={job.id} style={{marginBottom: 24}}>
            <JobCard
              { ...job }
              cancelTask={ cancelTask }
              deleteJob={ deleteJob }
            />
          </div>
        ))
      }
    </div>
  )
}

export const JobList = ({
  loading,
  error,
  jobs,
  status,
  addJob,
  nextJobFile,
  spoolNextPrint,
  cancelTask,
  deleteJob,
}) => {
  if (loading) return <div>Loading</div>
  if (error) return <div>Error</div>

  const disablePrintNextButton = (
    status !== 'READY' ||
    jobs.find(job => job.status === 'QUEUED') == null ||
    jobs.find(job => job.status === 'PRINTING') != null
  )

  const statuses = [
    'ERRORED',
    'CANCELLED',
    'DONE',
    'PRINTING',
    'QUEUED',
  ]

  return (
    <div>
      {
        statuses.map(status => (
          <JobSubList
            key={ status }
            status={ status }
            jobs={ jobs }
            cancelTask={ cancelTask }
            deleteJob={ deleteJob }
          />
        ))
      }

      <FloatingAddJobButton onChange={addJob} />
      <FloatingPrintNextButton
        disabled={ disablePrintNextButton }
        onClick={ spoolNextPrint }
      />
    </div>
  )
}

export default enhance(JobList)
