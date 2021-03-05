import { useEffect, useState } from 'react'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client'

const viewMachine = ({ machine }) => {
  const CONTINUE_VIEWING = gql`
    mutation continueViewingMachine($machineID: ID!) {
      continueViewingMachine(machineID: $machineID) {
        id
      }
    }
  `

  const [continueViewing, { error }] = useMutation(CONTINUE_VIEWING, {
    variables: {
      machineID: machine?.id,
    },
  })

  const [viewerUpdateCount, setViewerUpdateCount] = useState(0)

  console.log('viewW???', machine)
  useEffect(() => {
    if (machine?.id != null) {
      console.log('viewW!!!!!')
      continueViewing()

      const timeout = setTimeout(() => setViewerUpdateCount(i => i + 1), 2000)
      return () => clearTimeout(timeout)
    }
  }, [machine?.id, viewerUpdateCount])

  if (error != null) {
    throw error
  }
}

export default viewMachine
