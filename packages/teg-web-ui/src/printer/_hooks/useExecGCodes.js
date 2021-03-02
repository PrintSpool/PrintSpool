import { useCallback, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { useAsync } from 'react-async'

import { gql } from '@apollo/client'
import { useSnackbar } from 'notistack'

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
      override,
      sync,
      ...mutationOptions
    } = callback(...args)

    return execGCodes({
      ...mutationOptions,
      variables: {
        input: {
          machineID: machineID || machine.id,
          gcodes,
          override,
          sync,
        },
      },
    })
  }, dependencies)
}

// TODO: transition to this version everywhere for easier react-async workflows
export const useExecGCodes2 = (callback, dependencies, {
  throwOnError = false,
  snackbarOnError = true,
} = {}) => {
  const { enqueueSnackbar } = useSnackbar()
  const [execGCodes] = useMutation(EXEC_GCODES)

  const asyncExecGCodes = useAsync({
    deferFn: async (args) => {
      const {
        machine,
        machineID,
        gcodes,
        override,
        sync,
        ...mutationOptions
      } = callback(...args)

      // console.log({
      //   machineID: machineID || machine.id,
      //   gcodes,
      //   override,
      //   sync,
      // })

      // const resp =
      await execGCodes({
        ...mutationOptions,
        variables: {
          input: {
            machineID: machineID || machine.id,
            gcodes,
            override,
            sync,
          },
        },
      })
      // console.log(resp)
    },
  }, dependencies)

  if (snackbarOnError) {
    useEffect(() => {
      if (asyncExecGCodes.isSettled && asyncExecGCodes.error) {
        // // eslint-disable-next-line no-console
        // console.error(asyncExecGCodes.error)
        enqueueSnackbar(asyncExecGCodes.error.message, {
          variant: 'error',
        })
      }
    }, [asyncExecGCodes.error, asyncExecGCodes.isSettled])
  }

  if (throwOnError && asyncExecGCodes.error) {
    // eslint-disable-next-line no-console
    console.error(asyncExecGCodes.error)
    throw new Error(asyncExecGCodes.error)
  }

  return asyncExecGCodes
}

export default useExecGCodes
