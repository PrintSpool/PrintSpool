import React from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { compose, lifecycle } from 'recompose'

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

const heaterFragment = `
  id
  currentTemperature
  targetTemperature
`

const subscribeToJobList = props => params => {
  return props.jobListQuery.subscribeToMore({
    // TODO: job subscription
    document:  gql`
      subscription heatersChanged {
        heatersChanged(printerID: "test_printer_id") {
          ${heaterFragment}
        }
      }
    `,
    variables: {
    },
  })
}

const enhance = compose(
  graphql(
    gql`query jobListQuery {
      jobs {
        id
        name
        quantity
        tasksCompleted
        totalTasks
        status
        stoppedAt

        files {
          id
          status
        }

        tasks(excludeCompletedTasks: true) {
          name
          percentComplete
          startedAt
          status
          printer {
            name
          }
        }
      }
    }`,
    {
      name: 'jobListQuery',
      props: props => {
        const {
          loading,
          error,
          jobs,
        } = props.jobListQuery
        if (loading || error) return { loading, error }
        return {
          loading,
          error,
          jobs,
          queuedJobs: jobs.filter(job => job.status === 'QUEUED'),
          printingJobs: jobs.filter(job => job.status === 'PRINTING'),
          // subscribeToJobList: subscribeToJobList(props),
        }
      },
    },
  ),
  addJobHandler,
  spoolNextPrintHandler,
  lifecycle({
    componentWillMount() {
      // this.props.subscribeToJobList()
    }
  }),
)

export const JobList = ({
  loading,
  error,
  queuedJobs,
  printingJobs,
  addJob,
  nextJobFile,
  spoolNextPrint,
}) => {
  if (loading) return <div>Loading</div>
  if (error) return <div>Error</div>

  return (
    <div>
    { /*
      <Typography variant="subheading" gutterBottom>
        Done
      </Typography>
      { /*
        jobs
          .filter(job => ['DONE', 'CANCELLED', 'ERRORED'].includes(job.status))
          .map(job => (
            <div style={{marginBottom: 24}}>
              <JobCard key={job.id} {...job}/>
            </div>
          ))
      */ }
      {
        printingJobs.length > 0 &&
        <Typography variant="subheading" gutterBottom>
          Printing
        </Typography>
      }
      {
        printingJobs.map(job => (
          <div key={job.id} style={{marginBottom: 24}}>
            <JobCard {...job}/>
          </div>
        ))
      }
      {
        queuedJobs.length > 0 &&
        <Typography variant="subheading" gutterBottom>
          Queued
        </Typography>
      }
      {
        queuedJobs.map(job => (
          <div key={job.id} style={{marginBottom: 24}}>
            <JobCard {...job}/>
          </div>
        ))
      }
      <FloatingAddJobButton onChange={addJob} />
      <FloatingPrintNextButton
        disabled={ printingJobs.length > 0 || queuedJobs.length === 0 }
        onClick={ spoolNextPrint }
      />
    </div>
  )
}

export default enhance(JobList)
