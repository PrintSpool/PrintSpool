import React from 'react'
import { useRouteMatch, useHistory } from 'react-router'
import { gql, useMutation } from '@apollo/client'

import useMachineDefSuggestions from '../../common/_hooks/useMachineDefSuggestions'
import useLiveSubscription from '../_hooks/useLiveSubscription'
import ConfigView from './Config.view'
import { UPDATE_DIALOG_FRAGMENT, useUpdateDialog } from './components/UpdateDialog/UpdateDialog.page'
import transformComponentSchema from './printerComponents/transformComponentSchema'

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
        ...ConfigFormFragment
      }
    }
  }
  ${UPDATE_DIALOG_FRAGMENT}
`

const UPDATE_MACHINE = gql`
  mutation updateMachine($input: UpdateMachineInput!) {
    updateMachine(input: $input) {
      id
      configForm {
        ...ConfigFormFragment
      }
    }
  }
  ${UPDATE_DIALOG_FRAGMENT}
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

  const [updateMachine, updateMachineMutation] = useMutation(UPDATE_MACHINE, {
    update: (mutationResult: any) => {
      if (mutationResult.data != null) {
        history.push('../')
      }
    },
  })

  const onSubmit = async (model) => {
    await updateMachine({
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

  const updateDialogProps = useUpdateDialog({
    title: '3D Printer',
    open: machineDialogOpen,
    query: gql`query ($input: MachinesInput){ ...QueryFragment } ${DEVICE_QUERY}`,
    variables: { input: { machineID } },
    status: machine?.status,
    transformSchema: schema => transformComponentSchema({
      schema,
      materials: [],
      devices,
      machineDefSuggestions,
    }),
    getConfigForm: (data) => data.machines[0].configForm,
    updateMutation: updateMachineMutation,
    onSubmit,
  })

  if (loading || !data) return <div />

  if (error) {
    throw error
  }

  return <ConfigView {...{
    // machineDefSuggestions,
    // loadingMachineDefs,
    serverVersion,
    updateDialogProps,
  }} />
}

export default ConfigPage
