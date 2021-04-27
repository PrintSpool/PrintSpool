import React, { useCallback, useEffect, useMemo } from 'react'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client'
import { useHistory } from 'react-router-dom'
import { useSnackbar } from 'notistack'

import JobQueueView from './JobQueue.view'

import useLiveSubscription from '../_hooks/useLiveSubscription'

const LATEST_PRINT_FRAGMENT = gql`
  fragment LatestPrintFragment on Print {
    id
    part {
      id
      name
    }
    task {
      id
      percentComplete(digits: 1)
      eta
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
        components {
          id
          name
          heater {
            id
            blocking
            actualTemperature
            targetTemperature
          }
        }
      }
    }
  }
`

const PRINT_QUEUE_PART_FRAGMENT = gql`
  fragment PrintQueuePartFragment on Part {
    id
    name
    quantity
    position
    printsInProgress
    printsCompleted
    totalPrints
    startedFinalPrint
    # stoppedAt
  }
`

const PRINT_QUEUES_QUERY = gql`
  fragment QueryFragment on Query {
    machines(input: { machineID: $machineID }) {
      id
      status
    }
    latestPrints(input: { machineIDs: [$machineID] }) {
      ...LatestPrintFragment
    }
    printQueues(input: { machineID: $machineID }) {
      id
      name
      parts {
        ...PrintQueuePartFragment
      }
    }
  }
  ${LATEST_PRINT_FRAGMENT}
  ${PRINT_QUEUE_PART_FRAGMENT}
`

const STOP = gql`
  mutation stop($machineID: ID!) {
    stop(machineID: $machineID) {
      id
      status
    }
  }
`

const SET_PART_POSITIONS = gql`
  mutation setPartPositions($input: SetPartPositionsInput!) {
    setPartPositions(input: $input) {
      id
      position
    }
  }
`

const PRINT_FRAGMENT = gql`
  fragment PrintFragment on Print {
    ...LatestPrintFragment
    part {
      ...PrintQueuePartFragment
    }
  }
  ${LATEST_PRINT_FRAGMENT}
  ${PRINT_QUEUE_PART_FRAGMENT}
`

const PRINT = gql`
  mutation print($input: PrintInput!) {
    print(input: $input) {
      ...PrintFragment
      task {
        machine {
          id
          status
        }
      }
    }
  }
  ${PRINT_FRAGMENT}
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
    {
      ...SuccessMutationOpts('Print started!'),
      // Add the print to the latest prints cache so the UI updates immediately instead of waiting
      // on the next query polling
      update: (cache, { data: { print: newPrint } }) => {
        cache.modify({
          fields: {
            latestPrints: (previousPrints = [], { readField }) => {
              const newPrintRef = cache.writeFragment({
                data: newPrint,
                fragment: LATEST_PRINT_FRAGMENT,
              });

              // There can only be one active print per machine so remove the previous print.
              const nextPrints = previousPrints.filter((printRef) => {
                let taskRef: any = readField('task', printRef)
                let machineRef: any = readField('machine', taskRef)
                let taskMachineID: any = readField('id', machineRef)

                return taskMachineID !== newPrint.task.machine.id
              })

              // console.log({ newPrintRef, previousPrints }, [...nextPrints, newPrintRef])

              return [...nextPrints, newPrintRef]
            }
          }
        })
      }
    },
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
        pausePrint(taskID: $taskID) {
          ...PrintFragment
        }
      }
      ${PRINT_FRAGMENT}
    `,
    SuccessMutationOpts('Print pausing...'),
  )
  const [resumePrint, resumeMutation] = useMutation(
    gql`
      mutation resumePrint($taskID: ID!) {
        resumePrint(taskID: $taskID) {
          ...PrintFragment
        }
      }
      ${PRINT_FRAGMENT}
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

  useEffect(() => {
    if (mutationError == null) {
      return
    }

    enqueueSnackbar(
      `Error: ${mutationError?.message || mutationError}`,
      {
        variant: 'error',
      },
    )
  }, [mutationError])

  // Sort the parts in the browser so they can be re-ordered by mutation responses easily
  const printQueues = useMemo(() => {
    if (data == null) {
      return []
    }

    return data.printQueues.map(printQueue => {
      const nextPrintQueue = {
        ...printQueue,
        parts: [...printQueue.parts],
      }

      nextPrintQueue.parts.sort((a,b) => a.position - b.position)

      return nextPrintQueue
    })
  }, [data])

  const {
    machines = [],
    latestPrints = [],
  } = data || {}

  const nextPart = useMemo(() => (
    printQueues
      .map(printQueue => printQueue.parts)
      .flat()
      .find(part => !part.startedFinalPrint)
  ), [data])

  const readyMachine = machines.find(machine => (
    machine.status === 'READY'
  ))

  const printNext = useCallback(() => {
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
  }, [nextPart, readyMachine])

  if (loading) {
    return <div />
  }

  if (error) {
    throw error
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
