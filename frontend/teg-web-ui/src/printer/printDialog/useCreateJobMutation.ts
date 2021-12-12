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
  printQueueID: string,
  files: any,
): [() => Promise<any>, MutationResult<unknown>] => {
  // Update the print queue immediately upon adding a part
  const [mutation, mutationResult] = useMutation(addPartsToPrintQueueGraphQL, {
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
    const MB = 1000 * 1000
    const fileMBs = files[0].size / MB
    const startedAt = Date.now()

    const mutationInput = {
      printQueueID,
      name: files.map(f => f.name).join(', '),
      parts: [],
    }
    // console.log({ mutationInput })

    // read each file into memory
    await Promise.all(
      files.map(async (file) => {
        const { name } = file

        /* read the file */
        // eslint-disable-next-line no-undef
        // @ts-ignore
        // const fileReader = new FileReader()
        // fileReader.readAsText(file)

        // await new Promise((resolve) => {
        //   fileReader.onload = resolve
        // })

        mutationInput.parts.push({
          name,
          // content: fileReader.result,
          file,
        })
      }),
    )

    // const filesReadAt = Date.now()

    /* execute the mutation */
    const result = await mutation({
      variables: {
        input: mutationInput,
      },
    })

    // const readSeconds = (filesReadAt - startedAt) / 1000
    const totalSeconds = (Date.now() - startedAt) / 1000
    console.log(
      'Upload Complete: '
      + `${fileMBs.toFixed(1)}MB uploaded in ${totalSeconds.toFixed(1)}s `
      // + `(read time: ${readSeconds.toFixed(2)}s) = `
      + `${(fileMBs / totalSeconds).toFixed(1)} MB/s`
    )

    return result
  }, [files])

  return [addPartsToPrintQueue, mutationResult]
}

export default useCreateJobMutation
