import { useCallback } from 'react'
import { useMutation } from 'react-apollo-hooks'

import gql from 'graphql-tag'

const SPOOL_GCODES = gql`
  mutation spoolGCodes($input: SpoolGCodesInput!) {
    spoolGCodes(input: $input)
  }
`

const useSpoolGCodes = (callback) => {
  const spoolGCodesMutation = useMutation(SPOOL_GCODES)

  return useCallback((...args) => {
    const input = callback(...args)
    spoolGCodesMutation(input)
  })
}

export default useSpoolGCodes
