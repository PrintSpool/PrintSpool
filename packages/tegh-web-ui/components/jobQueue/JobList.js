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

        tasks(excludeCompletedTasks: true) {
          name
          percentComplete
          startedAt
          status
        }
      }
    }`,
    {
      name: 'jobListQuery',
      props: props => {
        const {
          loading,
          error,
          jobs
        } = props.jobListQuery
        return {
          loading,
          error,
          jobs,
          // subscribeToJobList: subscribeToJobList(props),
        }
      },
    },
  ),
  addJobHandler,
  lifecycle({
    componentWillMount() {
      // this.props.subscribeToJobList()
    }
  }),
)

export const JobList = ({
  loading,
  error,
  jobs,
  addJob,
}) => {
  console.log(jobs)
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
      <Typography variant="subheading" gutterBottom>
        Printing
      </Typography>
      {
        jobs.filter(job => job.status === 'PRINTING').map(job => (
          <div style={{marginBottom: 24}}>
            <JobCard key={job.id} {...job}/>
          </div>
        ))
      }
      <Typography variant="subheading" gutterBottom>
        Queued
      </Typography>
      {
        jobs.filter(job => job.status === 'QUEUED').map(job => (
          <div style={{marginBottom: 24}}>
            <JobCard key={job.id} {...job}/>
          </div>
        ))
      }
      <FloatingAddJobButton onChange={addJob} />
      <FloatingPrintNextButton
        disabled={
          jobs.filter(job => job.status === 'PRINTING').length > 0 ||
          jobs.filter(job => job.status === 'QUEUED').length === 0
        }
      />
    </div>
  )
}

export default enhance(JobList)
