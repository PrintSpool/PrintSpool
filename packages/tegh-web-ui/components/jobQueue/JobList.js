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

import withPrinterID from '../../higherOrderComponents/withPrinterID'
import addJobHandler from './mutations/addJobHandler'
import spoolNextPrintHandler from './mutations/spoolNextPrintHandler'

import FloatingAddJobButton from './FloatingAddJobButton'
import FloatingPrintNextButton from './FloatingPrintNextButton'
import JobCard from './JobCard'

const enhance = compose(
  addJobHandler,
  spoolNextPrintHandler,
)

const JobSubList = ({ jobs, status }) => {
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
            <JobCard {...job}/>
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
}) => {
  if (loading) return <div>Loading</div>
  if (error) return <div>Error</div>

  const disablePrintNextButton = (
    status === 'READY' &&
    jobs.find(job => jobs.status === 'queued') == null
  )

  return (
    <div>
      <JobSubList jobs={ jobs } status='ERRORED'/>
      <JobSubList jobs={ jobs } status='CANCELLED'/>
      <JobSubList jobs={ jobs } status='DONE'/>
      <JobSubList jobs={ jobs } status='PRINTING'/>
      <JobSubList jobs={ jobs } status='QUEUED'/>

      <FloatingAddJobButton onChange={addJob} />
      <FloatingPrintNextButton
        disabled={ disablePrintNextButton }
        onClick={ spoolNextPrint }
      />
    </div>
  )
}

export default enhance(JobList)
