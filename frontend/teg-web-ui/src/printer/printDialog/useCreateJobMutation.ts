import React, { useCallback } from 'react'

import { useMutation, MutationResult } from '@apollo/client'
import { gql } from '@apollo/client'
import { PRINT_QUEUE_PART_FRAGMENT } from '../jobQueue/JobQueue.graphql'

const addPartsToPrintQueueGraphQL = gql`
  mutation addPartsToPrintQueue($input: AddPartsToPrintQueueInput!) {
    addPartsToPrintQueue(input: $input) {
      id
      printQueueID
      parts {
        ...PrintQueuePartFragment
      }
    }
  }
  ${PRINT_QUEUE_PART_FRAGMENT}
`

const useCreateJobMutation = (
  mutationOpts,
): [() => Promise<any>, MutationResult<unknown>] => {
  // Update the print queue immediately upon adding a part
  const [mutation, mutationResult] = useMutation(addPartsToPrintQueueGraphQL, {
    ...mutationOpts,
    update: (cache, { data: { addPartsToPrintQueue: newPackage } }) => {
      cache.modify({
        id: cache.identify({
          __typename: 'PrintQueue',
          id: newPackage.printQueueID,
        }),
        fields: {
          parts: (cachedPartRefs) => {
            const newPartRefs = newPackage.parts.map(part => (
              cache.writeFragment({
                data: part,
                fragment: PRINT_QUEUE_PART_FRAGMENT,
              })
            ))

            return [
              ...cachedPartRefs,
              ...newPartRefs,
            ]
          },
        },
      })
    },
  })

  const addPartsToPrintQueue = useCallback(async () => {
    const { parts } = mutationOpts.variables.input

    const MB = 1000 * 1000
    const fileMBs = parts[0].file.size / MB
    const startedAt = Date.now()

    /* execute the mutation */
    const result = await mutation()

    // const readSeconds = (filesReadAt - startedAt) / 1000
    const totalSeconds = (Date.now() - startedAt) / 1000
    console.log(
      'Upload Complete: '
      + `${fileMBs.toFixed(1)}MB uploaded in ${totalSeconds.toFixed(1)}s `
      // + `(read time: ${readSeconds.toFixed(2)}s) = `
      + `${(fileMBs / totalSeconds).toFixed(1)} MB/s`
    )

    return result
  }, [mutationOpts])

  return [addPartsToPrintQueue, mutationResult]
}

export default useCreateJobMutation
