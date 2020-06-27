import React from 'react'
import useReactRouter from 'use-react-router'
import gql from 'graphql-tag'

import useLiveSubscription from '../../_hooks/useLiveSubscription'
import PrinterComponentsView from './PrinterComponents.view'
import { useMutation } from 'react-apollo-hooks'

const COMPONENTS_SUBSCRIPTION = gql`
  subscription ConfigSubscription($machineID: ID!) {
    live {
      patch { op, path, from, value }
      query {
        hasPendingUpdates
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
        machines(machineID: $machineID) {
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
    }
  }
`

const PrinterComponentsPage = () => {
  const { match: { params } } = useReactRouter()
  const { componentID, machineID, verb } = params

  const { data, error, loading } = useLiveSubscription(COMPONENTS_SUBSCRIPTION, {
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
