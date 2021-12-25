import React, { useEffect } from 'react'
import { useRouteMatch, useParams, useHistory } from 'react-router'
import { gql, useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'

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
      name
      status
      developerMode
      configForm {
        ...ConfigFormFragment
      }
    }
  }
  ${UPDATE_DIALOG_FRAGMENT}
`

const DELETE_MACHINE = gql`
  mutation deleteMachine($machineID: ID!) {
    deleteMachine(machineID: $machineID) {
      id
    }
  }
`
const UPDATE_MACHINE = gql`
  mutation updateMachine($input: UpdateMachineInput!) {
    updateMachine(input: $input) {
      id
      status
      developerMode
      configForm {
        ...ConfigFormFragment
      }
    }
  }
  ${UPDATE_DIALOG_FRAGMENT}
`

const ConfigPage = () => {
  const match = useRouteMatch()
  const { hostID, machineID } = useParams();
  const history = useHistory()
  const { enqueueSnackbar } = useSnackbar()

  const machineDialogOpen = match.path === '/:hostID/:machineID/config/machine/'

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

  const [deleteMachine, deleteMachineMutation] = useMutation(DELETE_MACHINE, {
    variables: { machineID: machine?.id },
  })

  useEffect(() => {
    if (deleteMachineMutation.data != null) {
      enqueueSnackbar('Printer deleted')
      history.push(`/${hostID}`)
    }
  }, [ deleteMachineMutation.data ])

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
    machine,
    serverVersion,
    updateDialogProps,
    deleteMachine,
  }} />
}

export default ConfigPage
