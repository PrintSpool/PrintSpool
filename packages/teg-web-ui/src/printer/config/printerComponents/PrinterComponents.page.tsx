import React from 'react'
import { useParams, useHistory } from 'react-router'
import { gql, useMutation } from '@apollo/client'

import useLiveSubscription from '../../_hooks/useLiveSubscription'
import PrinterComponentsView from './PrinterComponents.view'
import { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/UpdateDialog.page'
import useDeleteConfig from '../components/useDeleteConfig'

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
      developerMode
      fixedListComponentTypes
      components {
        id
        type
        name
        configForm {
          ...ConfigFormFragment
        }
      }
    }
  }
  ${UPDATE_DIALOG_FRAGMENT}
`

const UPDATE_COMPONENT = gql`
  mutation updateComponent($input: UpdateComponentInput!) {
    updateComponent(input: $input) {
      id
    }
  }
`

const DELETE_COMPONENT = gql`
  mutation deleteComponent($input: DeleteComponentInput!) {
    deleteComponent(input: $input) {
      id
    }
  }
`

const PrinterComponentsPage = () => {
  const history = useHistory()
  const params = useParams()
  const { componentID, machineID, verb } = params

  const { data, error, loading } = useLiveSubscription(COMPONENTS_QUERY, {
    variablesDef: '($machineID: ID!)',
    variables: {
      machineID,
    },
  })

  const {
    videoSources,
    machines: [
      machine
    ],
  } = data || { machines: [] }
  const { components, fixedListComponentTypes, status } = machine || {}
  const component = componentID && components?.find(c => c.id === componentID)

  const [updateComponent, updateComponentMutation] = useMutation(UPDATE_COMPONENT, {
    update: (mutationResult: any) => {
      if (mutationResult.data != null) {
        history.push('../')
      }
    },
  })

  const onSubmit = async (model) => {
    const nextModel = { ...model }
    if (model.materialID === 'NULL') {
      nextModel.materialID = null
    }

    await updateComponent({
      variables: {
        input: {
          machineID,
          componentID,
          modelVersion: component.configForm.modelVersion,
          model: nextModel,
        }
      }
    })
  }

  useDeleteConfig(DELETE_COMPONENT, {
    variables: {
      input: {
        machineID: machine?.id,
        componentID: component?.id,
      },
    },
    show: component != null && verb === 'delete',
    type: component?.type.toLowerCase(),
    title: component?.name,
  })

  if (loading) {
    return <div />
  }

  if (error) {
    throw error
  }

  return (
    <PrinterComponentsView
      {...{
        ...data,
        updateMutation: updateComponentMutation,
        selectedComponent: component,
        components,
        fixedListComponentTypes,
        videoSources,
        status,
        machine,
        onSubmit,
        componentID,
        verb,
      }}
    />
  )
}

export default PrinterComponentsPage
