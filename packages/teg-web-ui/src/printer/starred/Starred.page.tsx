import React, { useCallback, useEffect, useMemo } from 'react'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client'
import { useHistory } from 'react-router-dom'
import { useSnackbar } from 'notistack'

import JobQueueView from './Starred.view'

import useLiveSubscription from '../_hooks/useLiveSubscription'
import {
  DELETE_PART,
  PRINT_QUEUES_QUERY,
} from './Starred.graphql'
import { usePrintMutation } from '../jobQueue/JobQueue.graphql'

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

  const mutationError = (
    null
    || printMutation.error
    || deletePartsMutation.error
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
      }}
    />
  )
}

export default JobQueuePage
