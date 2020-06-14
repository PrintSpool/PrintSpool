import React, { useCallback } from 'react'

import { useMutation, MutationResult } from 'react-apollo-hooks'
import gql from 'graphql-tag'

const createJobGraphQL = gql`
  mutation createJob($input: CreateJobInput!) {
    createJob(input: $input) {
      id
      files {
        id
      }
    }
  }
`

const useCreateJobMutation = (
  files: any,
  options: any,
): [() => Promise<any>, MutationResult<unknown>] => {
  const [mutation, mutationResult] = useMutation(createJobGraphQL, options)

  const createJob = useCallback(async () => {
    const mutationInput = {
      name: files.map(f => f.name).join(', '),
      files: [],
    }
  
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
  
        mutationInput.files.push({
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

  return [createJob, mutationResult]
}

export default useCreateJobMutation
