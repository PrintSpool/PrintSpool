import React from 'react'
import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client'
import { useHistory } from 'react-router-dom'
import { useSnackbar } from 'notistack'

import JobQueueView from './JobQueue.view'

import useLiveSubscription from '../_hooks/useLiveSubscription'

const PRINT_QUEUES_QUERY = gql`
  fragment QueryFragment on Query {
    machines(input: { machineID: $machineID }) {
      id
      status
    }
    latestPrints(input: { machineIDs: [$machineID] }) {
      id
      part {
        id
        name
      }
      task {
        id
        percentComplete(digits: 1)
        estimatedPrintTimeMillis
        startedAt
        stoppedAt
        status
        paused
        settled
        partID
        machine {
          id
          name
          status
        }
      }
    }
    printQueues(input: { machineID: $machineID }) {
      id
      name
      parts {
        id
        name
        quantity
        printsInProgress
        printsCompleted
        totalPrints
        startedFinalPrint
        # stoppedAt
      }
    }
  }
`

const STOP = gql`
  mutation stop($machineID: ID!) {
    stop(machineID: $machineID) { id }
  }
`

const SET_PART_POSITIONS = gql`
  mutation setPartPositions($input: SetPartPositionsInput!) {
    setPartPositions(input: $input) { id }
  }
`

const PRINT = gql`
  mutation print($input: PrintInput!) {
    print(input: $input) { id }
  }
`

const DELETE_PART = gql`
  mutation deleteParts($input: DeletePartsInput!) {
    deleteParts(input: $input) { id }
  }
`

const JobQueuePage = ({
  match,
}) => {
  const { enqueueSnackbar } = useSnackbar()

  const { machineID } = match.params
  const history = useHistory()

  const { loading, data, error } = useLiveSubscription(PRINT_QUEUES_QUERY, {
    variablesDef: '($machineID: ID)',
    variables: {
      machineID,
    },
  })

  const SuccessMutationOpts = (msg) => ({
    onCompleted: () => {
      enqueueSnackbar(msg, {
        variant: 'success',
      })
    }
  })

  const [print, printMutation] = useMutation(
    PRINT,
    SuccessMutationOpts('Print started!'),
  )
  const [deleteParts, deletePartsMutation] = useMutation(DELETE_PART)
  const [cancelTask, cancelTaskMutation] = useMutation(
    STOP,
    SuccessMutationOpts('Print cancelled!'),
  )
  const [setPartPositions, setPartPositionsMutation] = useMutation(SET_PART_POSITIONS)
  const [pausePrint, pausePrintMutation] = useMutation(
    gql`
      mutation pausePrint($taskID: ID!) {
        pausePrint(taskID: $taskID) { id }
      }
    `,
    SuccessMutationOpts('Print paused!'),
  )
  const [resumePrint, resumeMutation] = useMutation(
    gql`
      mutation resumePrint($taskID: ID!) {
        resumePrint(taskID: $taskID) { id }
      }
    `,
    SuccessMutationOpts('Print resumed!'),
  )

  const mutationError = (
    null
    || printMutation.error
    || deletePartsMutation.error
    || cancelTaskMutation.error
    || pausePrintMutation.error
    || setPartPositionsMutation.error
    || resumeMutation.error
  )

  if (loading) {
    return <div />
  }

  if (error) {
    throw error
  }

  const {
    machines,
    printQueues,
    latestPrints,
  } = data

  const nextPart = printQueues
    .map(printQueue => printQueue.parts)
    .flat()
    .find(part => !part.startedFinalPrint)

  const readyMachine = machines.find(machine => (
    machine.status === 'READY'
  ))

  const printNext = () => {
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

  if (mutationError) {
    throw mutationError
  }

  return (
    <JobQueueView
      {...{
        latestPrints,
        printQueues,
        machines,
        nextPart,
        printNext,
        print: (part) => print({
          variables: {
            input: {
              machineID: readyMachine.id,
              partID: part.id,
            },
          },
        }),
        printMutation,
        deleteParts,
        cancelTask,
        pausePrint,
        resumePrint,
        setPartPositions,
        history,
      }}
    />
  )
}

export default JobQueuePage
