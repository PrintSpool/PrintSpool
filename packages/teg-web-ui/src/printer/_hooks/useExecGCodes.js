import { useCallback } from 'react'
import { useMutation } from 'react-apollo-hooks'

import gql from 'graphql-tag'

const EXEC_GCODES = gql`
  mutation execGCodes($input: ExecGCodesInput!) {
    execGCodes(input: $input) { id }
  }
`

const useExecGCodes = (callback, dependencies) => {
  const [execGCodesMutation] = useMutation(EXEC_GCODES)

  return useCallback((...args) => {
    const {
      machine,
      machineID,
      gcodes,
      ...mutationOptions
    } = callback(...args)

    execGCodesMutation({
      ...mutationOptions,
      variables: {
        input: {
          machineID: machineID || machine.id,
          gcodes,
        },
      },
    })
  }, dependencies)
}

export default useExecGCodes
