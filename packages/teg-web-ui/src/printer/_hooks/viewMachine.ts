import { useEffect, useState } from 'react'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client'

const viewMachine = ({ machine }) => {
  const CONTINUE_VIEWING = gql`
    mutation continueViewingMachine($machineID: ID!) {
      continueViewingMachine(machineID: $machineID)
    }
  `
  const continueViewerMutation = useMutation(CONTINUE_VIEWING, {
    variables: {
      machineID: machine?.id,
    },
  })

  const [viewerUpdateCount, setViewerUpdateCount] = useState(0)

  useEffect(() => {
    if (machine?.id != null) {
      continueViewerMutation[0]()

      const timeout = setTimeout(() => setViewerUpdateCount(i => i + 1), 2000)
      return () => clearTimeout(timeout)
    }
  }, [machine?.id, viewerUpdateCount])
}

export default viewMachine
