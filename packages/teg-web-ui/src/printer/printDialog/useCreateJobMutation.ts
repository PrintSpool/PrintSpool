import React, { useCallback } from 'react'

import { useMutation, MutationResult } from '@apollo/client'
import { gql } from '@apollo/client'

const addPartsToPrintQueueGraphQL = gql`
  mutation addPartsToPrintQueue($input: AddPartsToPrintQueueInput!) {
    addPartsToPrintQueue(input: $input) {
      id
      parts {
        id
      }
    }
  }
`

const useCreateJobMutation = (
  printQueueID: string,
  files: any,
  options: any,
): [() => Promise<any>, MutationResult<unknown>] => {
  const [mutation, mutationResult] = useMutation(addPartsToPrintQueueGraphQL, options)

  const addPartsToPrintQueue = useCallback(async () => {
    const mutationInput = {
      printQueueID,
      name: files.map(f => f.name).join(', '),
      parts: [],
    }
    console.log({ mutationInput })

    // read each file into memory
    await Promise.all(
      files.map(async (file) => {
        const { name } = file

        /* read the file */
        // eslint-disable-next-line no-undef
        const fileReader = new FileReader()
        fileReader.readAsText(file)

        await new Promise((resolve) => {
          fileReader.onload = resolve
        })

        mutationInput.parts.push({
          name,
          content: fileReader.result,
        })
      }),
    )

    /* execute the mutation */
    return mutation({
      variables: {
        input: mutationInput,
      },
    })
  }, [files])

  return [addPartsToPrintQueue, mutationResult]
}

export default useCreateJobMutation
