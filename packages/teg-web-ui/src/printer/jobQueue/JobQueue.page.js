import React from 'react'
import gql from 'graphql-tag'
import { useMutation } from 'react-apollo-hooks'

import JobList from './JobQueue.view'

import useLiveSubscription from '../_hooks/useLiveSubscription'

const JOBS_SUBSCRIPTION = gql`
  subscription JobQueueSubscription {
    live {
      patch { op, path, from, value }
      query {
        machines {
          id
          status
        }
        jobQueue {
          name
          jobs {
            id
            name
            quantity
            printsCompleted
            totalPrints
            isDone
            stoppedAt

            files {
              id
              printsQueued
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

const SPOOL_JOB_FILE = gql`
  mutation spoolJobFile($input: SpoolJobFileInput!) {
    spoolJobFile(input: $input) { id }
  }
`

const DELETE_JOB = gql`
  mutation deleteJob($input: DeleteJobInput!) {
    deleteJob(input: $input)
  }
`

const JobQueuePage = () => {
  const { loading, data, error } = useLiveSubscription(JOBS_SUBSCRIPTION)

  const [spoolJobFile] = useMutation(SPOOL_JOB_FILE)
  const [deleteJob] = useMutation(DELETE_JOB)
  const [cancelTask] = useMutation(ESTOP)

  if (loading) {
    return <div />
  }

  if (error) {
    throw error
  }

  const {
    machines,
    jobQueue: { jobs },
  } = data

  const jobFiles = jobs
    .map(job => job.files)
    .flat()

  const nextJobFile = jobFiles.find(jobFile => jobFile.printsQueued > 0)

  const readyMachine = machines.find(machine => (
    machine.status === 'READY'
  ))

  const spoolNextPrint = () => {
    if (nextJobFile == null) {
      throw new Error('nothing in the queue to print')
    }
    if (readyMachine == null) {
      throw new Error('No machine is ready to start a print')
    }

    spoolJobFile({
      variables: {
        input: {
          machineID: readyMachine.id,
          jobFileID: nextJobFile.id,
        },
      },
    })
  }

  return (
    <JobList
      {...{
        jobs,
        machines,
        spoolNextPrint,
        deleteJob,
        cancelTask,
      }}
    />
  )
}

export default JobQueuePage
