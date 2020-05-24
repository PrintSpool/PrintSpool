import React from 'react'
import { compose, withProps } from 'recompose'
import gql from 'graphql-tag'
import { useMutation } from 'react-apollo-hooks'

import {
  Typography,
} from '@material-ui/core'

import TaskStatusRow from '../jobQueue/components/TaskStatusRow'

import withLiveData from '../common/higherOrderComponents/withLiveData'

const JOB_SUBSCRIPTION = gql`
  subscription JobSubscription($jobID: ID!) {
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
              machine {
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

const ESTOP = gql`
  mutation eStop($machineID: ID!) {
    eStop(machineID: $machineID)
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
)

const JobPage = ({
  machine,
  job: {
    name,
    tasks,
    printsCompleted,
    totalPrints,
    history,
  },
}) => {
  const [cancelTask] = useMutation(ESTOP, {
    variables: { machineID: machine.id },
  })

  return (
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
}

export default enhance(JobPage)
