import React from 'react'
import { compose, withProps } from 'recompose'
import gql from 'graphql-tag'

import {
  Typography,
} from '@material-ui/core'

import TaskStatusRow from '../queue/components/TaskStatusRow'
import cancelTaskHandler from '../queue/mutations/cancelTaskHandler'

import withLiveData from '../shared/higherOrderComponents/withLiveData'

const JOB_SUBSCRIPTION = gql`
  subscription($jobID: ID!) {
    live {
      patch { op, path, from, value }
      query {
        jobQueue {
          jobs(id: $jobID) {
            id
            name
            quantity
            printsCompleted
            totalPrints
            stoppedAt

            files {
              id
              printsQueued
            }

            history {
              id
              createdAt
              type
            }

            tasks {
              id
              name
              percentComplete(digits: 1)
              startedAt
              status
              printer {
                id
                name
              }
            }
          }
        }
      }
    }
  }
`

const enhance = compose(
  withProps(ownProps => ({
    subscription: JOB_SUBSCRIPTION,
    variables: {
      jobID: ownProps.match.params.jobID,
    },
  })),
  withLiveData,
  withProps(ownProps => ({
    job: ownProps.jobQueue.jobs[0],
  })),
  cancelTaskHandler,
)

const JobPage = ({
  job: {
    name,
    tasks,
    printsCompleted,
    totalPrints,
    history,
  },
  cancelTask,
}) => (
  <div>
    <main>
      <Typography variant="h4">
        { name }
      </Typography>
      {
        `${printsCompleted} / ${totalPrints} prints completed`
      }
      <Typography variant="h5">
        Current Prints
      </Typography>
      {
        tasks.length === 0 && (
          <Typography variant="h5" color="textSecondary">
            This job is not currently being printed
          </Typography>
        )
      }
      {
        /* Task list segment */
        tasks.map(task => (
          <TaskStatusRow
            task={task}
            cancelTask={cancelTask}
            key={task.id}
          />
        ))
      }
      <Typography variant="h5">
        History
      </Typography>
      {
        history.length === 0 && (
          <Typography variant="h5" color="textSecondary">
            Nothing yet
          </Typography>
        )
      }
      {
        history.reverse().map(e => (
          <div key={e.id}>
            {`${e.createdAt}: ${e.type}`}
          </div>
        ))
      }
    </main>
  </div>
)

export default enhance(JobPage)
