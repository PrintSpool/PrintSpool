import React from 'react'
import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client'

import JobQueueView from './JobQueue.view'

import useLiveSubscription from '../_hooks/useLiveSubscription'

const PRINT_QUEUES_QUERY = gql`
  fragment QueryFragment on Query {
    machines(input: { machineID: $machineID }) {
      id
      status
    }
    printQueues(input: { machineID: $machineID }) {
      id
      name
      parts {
        id
        name
        quantity
        printsCompleted
        totalPrints
        startedFinalPrint
        # stoppedAt

        tasks {
          id
          percentComplete(digits: 1)
          estimatedPrintTimeMillis
          startedAt
          stoppedAt
          status
          paused
          machine {
            id
            name
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

const PRINT = gql`
  mutation print($input: PrintInput!) {
    print(input: $input) { id }
  }
`

const DELETE_JOB = gql`
  mutation deleteJob($input: DeleteJobInput!) {
    deleteJob(input: $input)
  }
`

const JobQueuePage = ({
  match,
}) => {
  const { machineID } = match.params

  const { loading, data, error } = useLiveSubscription(PRINT_QUEUES_QUERY, {
    variablesDef: '($machineID: ID)',
    variables: {
      machineID,
    },
  })

  const [print] = useMutation(PRINT)
  const [deleteJob] = useMutation(DELETE_JOB)
  const [cancelTask] = useMutation(ESTOP)
  const [setJobPosition] = useMutation(SET_JOB_POSITION)
  const [pausePrint] = useMutation(gql`
    mutation pausePrint($taskID: ID!) {
      pausePrint(taskID: $taskID) { id }
    }
  `)
  const [resumePrint] = useMutation(gql`
    mutation resumePrint($taskID: ID!) {
      resumePrint(taskID: $taskID) { id }
    }
  `)

  const moveToTopOfQueue = ({ jobID }) => setJobPosition({
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

  const {
    machines,
    printQueues,
  } = data

  const nextPart = printQueues
    .map(printQueue => printQueue.parts)
    .flat()
    .find(part => !part.startedFinalPrint)

  const readyMachine = machines.find(machine => (
    machine.status === 'READY'
  ))

  const spoolNextPrint = () => {
    if (nextPart == null) {
      throw new Error('nothing in the queue to print')
    }
    if (readyMachine == null) {
      throw new Error('No machine is ready to start a print')
    }

    print({
      variables: {
        input: {
          machineID: readyMachine.id,
          partID: nextPart.id,
        },
      },
    })
  }

  return (
    <JobQueueView
      {...{
        printQueues,
        machines,
        nextPart,
        spoolNextPrint,
        deleteJob,
        cancelTask,
        pausePrint,
        resumePrint,
        moveToTopOfQueue,
      }}
    />
  )
}

export default JobQueuePage
