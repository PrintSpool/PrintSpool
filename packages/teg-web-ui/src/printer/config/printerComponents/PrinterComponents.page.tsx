import React from 'react'
import useReactRouter from 'use-react-router'
import { gql } from '@apollo/client'

import useLiveSubscription from '../../_hooks/useLiveSubscription'
import PrinterComponentsView from './PrinterComponents.view'
import { useMutation } from '@apollo/client'

const COMPONENTS_QUERY = gql`
  fragment QueryFragment on Query {
    # hasPendingUpdates
    devices {
      id
    }
    videoSources {
      id
    }
    materials {
      id
      name
    }
    machines(input: { machineID: $machineID }) {
      id
      status
      fixedListComponentTypes
      components {
        id
        type
        name
      }
    }
  }
`

const PrinterComponentsPage = () => {
  const { match: { params } } = useReactRouter()
  const { componentID, machineID, verb } = params

  const { data, error, loading } = useLiveSubscription(COMPONENTS_QUERY, {
    variablesDef: '($machineID: ID!)',
    variables: {
      machineID,
    },
  })

  if (loading) {
    return <div />
  }

  if (error) {
    throw error
  }

  const { machines } = data
  const { components, fixedListComponentTypes, status } = machines[0]

  console.log(
    { componentID },
    components.find(c => c.id === componentID)
  )

  return (
    <PrinterComponentsView
      {...{
        ...data,
        selectedComponent: components.find(c => c.id === componentID),
        components,
        fixedListComponentTypes,
        status,
        machineID,
        componentID,
        verb,
      }}
    />
  )
}

export default PrinterComponentsPage
