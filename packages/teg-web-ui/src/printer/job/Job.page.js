import React from 'react'
import gql from 'graphql-tag'
import { useMutation } from 'react-apollo-hooks'
import useReactRouter from 'use-react-router'

import useLiveSubscription from '../_hooks/useLiveSubscription'

import JobView from './Job.view'

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

const JobPage = () => {
  const { match: { params } } = useReactRouter()

  const { loading, error, data } = useLiveSubscription(JOB_SUBSCRIPTION, {
    variables: {
      jobID: params.jobID,
    },
  })

  const [cancelTask] = useMutation(ESTOP)

  if (loading) {
    return <div />
  }

  if (error) {
    throw error
  }

  const job = data.jobQueue.jobs[0]

  return (
    <JobView
      {...{
        job,
        cancelTask,
      }}
    />
  )
}

export default JobPage
