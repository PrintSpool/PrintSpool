import React from 'react'
import { gql } from '@apollo/client'
import { useHistory, useParams } from 'react-router'

import useLiveSubscription from '../../_hooks/useLiveSubscription'
import PrintHistoryView from './PrintHistory.view'
import { useSnackbar } from 'notistack'

const PART_QUERY = gql`
  fragment QueryFragment on Query {
    machines(input: { machineID: $machineID }) {
      id
      name
    }
    parts(input: { partID: $partID }) {
      id
      name
      quantity
      printsCompleted
      totalPrints

      tasks(input: { pending: false, settled: true } ) {
        id
        percentComplete(digits: 1)
        eta
        estimatedFilamentMeters
        startedAt
        stoppedAt
        status
        paused
        settled
      }
    }
  }
`

const PrintHistoryPage = () => {
  const { machineID, partID } = useParams()

  const { loading, error, data } = useLiveSubscription(PART_QUERY, {
    variablesDef: '($machineID: ID, $partID: ID)',
    variables: {
      machineID,
      partID,
    },
  })

  const part = data?.parts[0]

  if (loading) {
    return <div />
  }

  if (error != null) {
    throw error
  }

  return (
    <PrintHistoryView {...{
      machineName: data.machines[0].name,
      part,
    }} />
  )
}

export default PrintHistoryPage
