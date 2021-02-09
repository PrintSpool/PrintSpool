import React from 'react'
import { useRouteMatch, useHistory } from 'react-router'
import { gql, useMutation } from '@apollo/client'

import useMachineDefSuggestions from '../../common/_hooks/useMachineDefSuggestions'
import useLiveSubscription from '../_hooks/useLiveSubscription'
import ConfigView from './Config.view'
import { UPDATE_DIALOG_FRAGMENT } from './components/UpdateDialog/UpdateDialog.page'

const DEVICE_QUERY = gql`
  fragment QueryFragment on Query {
    serverVersion
    # hasPendingUpdates
    devices {
      id
    }
    machines(input: $input) {
      id
      status
      configForm {
        ...UpdateDialogFragment
      }
    }
  }
  ${UPDATE_DIALOG_FRAGMENT}
`

const UPDATE_MACHINE = gql`
  mutation updateMachine($input: UpdateMachineInput!) {
    updateMachine(input: $input) {
      id
    }
  }
`

const ConfigPage = () => {
  const match = useRouteMatch()
  const history = useHistory()

  const { machineID } = match.params
  const machineDialogOpen = match.path === '/m/:hostID/:machineID/config/machine/'

  const { loading, data, error } = useLiveSubscription(DEVICE_QUERY, {
    variablesDef: '($input: MachinesInput)',
    variables: { input: { machineID } },
  })
  const {
    serverVersion,
    // hasPendingUpdates,
    devices,
    machines: [
      machine
    ],
  } = data || { machines: [] }

  const [updateMachine, mutation] = useMutation(UPDATE_MACHINE, {
    update: (mutationResult: any) => {
      if (mutationResult.data != null) {
        history.push('../')
      }
    },
  })

  const onSubmit = (model) => {
    console.log({
      input: {
        machineID,
        modelVersion: machine.configForm.modelVersion,
        model,
      }
    })
    updateMachine({
      variables: {
        input: {
          machineID,
          modelVersion: machine.configForm.modelVersion,
          model,
        }
      }
    })
  }

  const {
    suggestions: machineDefSuggestions,
    loading: loadingMachineDefs,
  } = useMachineDefSuggestions()

  if (loading || !data) return <div />

  if (error || mutation.error) {
    throw error || mutation.error
  }

  return <ConfigView {...{
    loading,
    error,
    machineDialogOpen,
    onDialogClose: () => history.push('../'),
    onSubmit,
    machineDefSuggestions,
    loadingMachineDefs,
    serverVersion,
    // hasPendingUpdates,
    devices,
    machine,
  }} />
}

export default ConfigPage
