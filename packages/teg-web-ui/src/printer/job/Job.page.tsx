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

            # history {
            #   id
            #   createdAt
            #   type
            # }

            tasks {
              id
              name
              percentComplete(digits: 1)
              # startedAt
              status
              machine {
                id
                # name
                components {
                  id
                  type
                }
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

const SET_JOB_POSITION = gql`
  mutation setJobPosition($input: SetJobPositionInput!) {
    setJobPosition(input: $input)
  }
`

const JobPage = () => {
  const { match: { params } } = useReactRouter()
  const { jobID } = params

  const { loading, error, data } = useLiveSubscription(JOB_SUBSCRIPTION, {
    variables: {
      jobID,
    },
  })

  const [cancelTask] = useMutation(ESTOP)
  const [setJobPosition] = useMutation(SET_JOB_POSITION)

  const moveToTopOfQueue = () => setJobPosition({
    variables: {
      input: {
        jobID,
        position: 0,
      },
    },
  })

  if (loading) {
    return <div />
  }

  if (error) {
    throw error
  }

  const job = (data as any).jobQueue.jobs[0]

  return (
    <JobView
      {...{
        job,
        cancelTask,
        moveToTopOfQueue,
      }}
    />
  )
}

export default JobPage
