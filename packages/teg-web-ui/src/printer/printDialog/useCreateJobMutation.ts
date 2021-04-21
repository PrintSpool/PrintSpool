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
    const MB = 1000 * 1000
    const fileMBs = files[0].size / MB
    const startedAt = Date.now()

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

    const filesReadAt = Date.now()

    /* execute the mutation */
    const result = await mutation({
      variables: {
        input: mutationInput,
      },
    })

    const readSeconds = (filesReadAt - startedAt) / 1000
    const totalSeconds = (Date.now() - startedAt) / 1000
    console.log(
      'Upload Complete: '
      + `${fileMBs.toFixed(1)}MB uploaded in ${totalSeconds.toFixed(1)}s `
      + `(read time: ${readSeconds.toFixed(2)}s) = `
      + `${(fileMBs / totalSeconds).toFixed(1)} MB/s`
    )

    return result
  }, [files])

  return [addPartsToPrintQueue, mutationResult]
}

export default useCreateJobMutation
