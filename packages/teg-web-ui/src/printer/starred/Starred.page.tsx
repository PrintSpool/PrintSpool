import React, { useCallback, useEffect, useMemo } from 'react'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client'
import { useHistory } from 'react-router-dom'
import { useSnackbar } from 'notistack'

import JobQueueView from './Starred.view'

import useLiveSubscription from '../_hooks/useLiveSubscription'
import {
  ADD_STARRED_PACKAGES_TO_PRINT_QUEUE,
  DELETE_PART,
  PRINT_QUEUES_QUERY,
  PRINT_QUEUE_PART_FRAGMENT,
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
    fetchPolicy: 'network-only',
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

  const [addToQueue, addToQueueMutation] = useMutation(ADD_STARRED_PACKAGES_TO_PRINT_QUEUE)

  const [setStarred, setStarredMutation] = useMutation(
    gql`
      mutation setStarred($input: SetStarredInput!) {
        setStarred(input: $input) {
          id
          parts {
            ...PrintQueuePartFragment
          }
        }
      }
      ${PRINT_QUEUE_PART_FRAGMENT}
    `,
  )

  const mutationError = (
    null
    || printMutation.error
    || deletePartsMutation.error
    || addToQueueMutation.error
    || setStarredMutation.error
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
        print: async (part) => {
          const addToQueueResult = await addToQueue({
            variables: {
              input: {
                packageIDs: [part.packageID],
              },
            },
          })

          if (addToQueueResult.errors != null) {
            return
          }

          const partID = addToQueueResult
            .data
            .addStarredPackagesToPrintQueue[0]
            .parts[0]
            .id

          await print({
            variables: {
              input: {
                machineID: readyMachine.id,
                partID,
              },
            },
          })
        },
        printMutation,
        addToQueue,
        deleteParts,
        setStarred,
      }}
    />
  )
}

export default JobQueuePage
