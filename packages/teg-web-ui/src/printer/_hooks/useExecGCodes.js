import { useCallback } from 'react'
import { useMutation } from 'react-apollo-hooks'
import { useAsync } from 'react-async'

import gql from 'graphql-tag'

export const EXEC_GCODES = gql`
  mutation execGCodes($input: ExecGCodesInput!) {
    execGCodes(input: $input) { id }
  }
`

const useExecGCodes = (callback, dependencies) => {
  const [execGCodes, results] = useMutation(EXEC_GCODES)

  if (results.error) {
    console.error(results.error)
    throw results.error
  }

  return useCallback((...args) => {
    const {
      machine,
      machineID,
      gcodes,
      sync,
      ...mutationOptions
    } = callback(...args)

    execGCodes({
      ...mutationOptions,
      variables: {
        input: {
          machineID: machineID || machine.id,
          gcodes,
          sync,
        },
      },
    })
  }, dependencies)
}

// TODO: transition to this version everywhere for easier react-async workflows
export const useExecGCodes2 = (callback, dependencies) => {
  const [execGCodes] = useMutation(EXEC_GCODES)

  const asyncExecGCodes = useAsync({
    deferFn: async (args) => {
      const {
        machine,
        machineID,
        gcodes,
        sync,
        ...mutationOptions
      } = callback(...args)

      await execGCodes({
        ...mutationOptions,
        variables: {
          input: {
            machineID: machineID || machine.id,
            gcodes,
            sync,
          },
        },
      })
    },
  }, dependencies)

  if (asyncExecGCodes.error) {
    console.error(asyncExecGCodes.error)
    throw new Error(asyncExecGCodes.error)
  }

  return asyncExecGCodes
}

export default useExecGCodes
