import React from 'react'
import { useParams, useHistory } from 'react-router'
import { gql } from '@apollo/client'

import useLiveSubscription from '../../_hooks/useLiveSubscription'
import PrinterComponentsView from './PrinterComponents.view'
import { useMutation } from '@apollo/client'
import { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/UpdateDialog.page'

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
        configForm {
          ...UpdateDialogFragment
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
    machines: [
      machine
    ],
  } = data || { machines: [] }
  const { components, fixedListComponentTypes, status } = machine || {}

  const [updateComponent, mutation] = useMutation(UPDATE_COMPONENT, {
    update: (mutationResult: any) => {
      if (mutationResult.data != null) {
        history.push('../')
      }
    },
  })

  const onSubmit = (model) => {
    updateComponent({
      variables: {
        input: {
          machineID,
          componentID,
          modelVersion: components.find(c => c.id === componentID).configForm.modelVersion,
          model,
        }
      }
    })
  }

  if (loading) {
    return <div />
  }

  if (error || mutation.error) {
    throw error || mutation.error
  }

  return (
    <PrinterComponentsView
      {...{
        ...data,
        selectedComponent: components.find(c => c.id === componentID),
        components,
        fixedListComponentTypes,
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
