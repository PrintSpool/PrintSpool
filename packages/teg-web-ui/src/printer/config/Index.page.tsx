import React from 'react'
import { useRouteMatch } from 'react-router'
import { gql } from '@apollo/client'

import useMachineDefSuggestions from '../../common/_hooks/useMachineDefSuggestions'
import useLiveSubscription from '../_hooks/useLiveSubscription'
import ConfigView from './Index.view'

const DEVICE_QUERY = gql`
  fragment QueryFragment on Query {
    serverVersion
    # hasPendingUpdates
    devices {
      id
    }
    machines {
      id
      status
    }
  }
`

const ConfigPage = () => {
  const match = useRouteMatch()
  const { loading, data, error } = useLiveSubscription(DEVICE_QUERY)

  const { machineID } = match.params
  const machineDialogOpen = match.path === '/m/:hostID/:machineID/config/machine/'

  const {
    suggestions: machineDefSuggestions,
    loading: loadingMachineDefs,
  } = useMachineDefSuggestions()

  const {
    serverVersion,
    // hasPendingUpdates,
    devices,
    machines,
  } = data || {}

  return <ConfigView {...{
    loading,
    data,
    error,
    machineID,
    machineDialogOpen,
    machineDefSuggestions,
    loadingMachineDefs,
    serverVersion,
    // hasPendingUpdates,
    devices,
    machines,
  }} />
}

export default ConfigPage
