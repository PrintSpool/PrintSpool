import { useCallback } from 'react'
import { useMutation } from 'react-apollo-hooks'

import gql from 'graphql-tag'

const EXEC_GCODES = gql`
  mutation execGCodes($input: ExecGCodesInput!) {
    execGCodes(input: $input) { id }
  }
`

const useSpoolGCodes = (callback) => {
  const execGCodesMutation = useMutation(EXEC_GCODES)

  return useCallback((...args) => {
    const input = callback(...args)
    execGCodesMutation(input)
  })
}

export default useSpoolGCodes
