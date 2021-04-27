import React, { useCallback, useEffect, useMemo } from 'react'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client'
import { useHistory } from 'react-router-dom'
import { useSnackbar } from 'notistack'

import JobQueueView from './JobQueue.view'

import useLiveSubscription from '../_hooks/useLiveSubscription'
import {
  DELETE_PART,
  PRINT_FRAGMENT,
  PRINT_QUEUES_QUERY,
  SET_PART_POSITIONS,
  STOP,
  usePrintMutation,
} from './JobQueue.graphql'

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

  const [print, printMutation] = usePrintMutation()

  const [deleteParts, deletePartsMutation] = useMutation(DELETE_PART, {
    // Remove the parts from the print queues as soon as the delete part mutation completes
    update: (cache, { data: { deleteParts: { partIDs } } }) => {
      data.printQueues.forEach((printQueue) => {
        cache.modify({
          id: cache.identify(printQueue),
          fields: {
            parts: (cachedPartRefs, { readField }) => {
              return cachedPartRefs
                .filter(partRef => !partIDs.includes(readField('id', partRef)))
            },
          },
        })
      })
    },
  })

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
