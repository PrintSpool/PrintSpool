import React from 'react'
import gql from 'graphql-tag'
import { useMutation, useQuery } from 'react-apollo-hooks'
import useReactRouter from 'use-react-router'

// import useLiveSubscription from '../_hooks/useLiveSubscription'
import { ComponentControlFragment } from '../manualControl/printerComponents/ComponentControl'
import JobView from './Job.view'
import useExecGCodes from '../_hooks/useExecGCodes'
import PrinterStatusGraphQL from '../common/PrinterStatus.graphql'

const JOB_SUBSCRIPTION = gql`
#  subscription JobSubscription($jobID: ID!) {
#    live {
#      patch { op, path, from, value }
#      query {
      query($jobID: ID!) {
        machines {
          ...PrinterStatus
          components {
            ...ComponentControlFragment
          }
        }
        jobQueue {
          jobs(id: $jobID) {
            id
            name
            quantity
            printsCompleted
            totalPrints
            # stoppedAt

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
#    }
#  }

  # fragments
  ${ComponentControlFragment}
  ${PrinterStatusGraphQL}
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

  // const { loading, error, data } = useLiveSubscription(JOB_SUBSCRIPTION, {
  //   variables: {
  //     jobID,
  //   },
  // })

  const { loading, error, data } = useQuery(JOB_SUBSCRIPTION, {
    pollInterval: 1000,
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

  const machine = ((data as any)?.machines || [])[0]
  const job = (data as any)?.jobQueue?.jobs[0]

  const execGCodes = useExecGCodes(args => ({ machine, ...args }), [machine])
  const isReady = machine?.status === 'READY'
  const isPrinting = machine?.status === 'PRINTING'

  console.log({ data, error, loading });


  if (error) {
    throw error
  }

  if (loading || !data) {
    return <div />
  }

  return (
    <JobView
      {...{
        machine,
        job,
        cancelTask,
        moveToTopOfQueue,
        execGCodes,
        isReady,
        isPrinting,
      }}
    />
  )
}

export default JobPage
