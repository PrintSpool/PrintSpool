import React, { useEffect } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { gql, useMutation } from '@apollo/client'
import useLiveSubscription from '../_hooks/useLiveSubscription'
import transformComponentSchema from '../config/printerComponents/transformComponentSchema'
import { CONFIG_FORM_FRAGMENT } from '../config/components/ConfigForm/ConfigForm'

import AddPrinterView from './AddPrinter.view'

const QUERY = gql`
  fragment QueryFragment on Query {
    isConfigured
    devices {
      id
    }
    configForm: machineConfigForm {
      ...ConfigFormFragment
    }
  }
  ${CONFIG_FORM_FRAGMENT}
`

const CREATE_MACHINE = gql`
  mutation(
    $input: CreateMachineInput!
  ) {
    createMachine(input: $input) {
      id
    }
  }
`

const AddPrinterPage = () => {
  const { hostID } = useParams()
  const history = useHistory()

  const [createMachine, mutation] = useMutation(CREATE_MACHINE)

  useEffect(() => {
    if (mutation.data == null) {
      return
    }

    history.push(`/m/${hostID}/${mutation.data.createMachine.id}/`)
  }, [mutation.data])

  const { data, error, loading } = useLiveSubscription(QUERY, {
    fetchPolicy: 'network-only',
  });

  let {
    devices,
    configForm
  } = data || {}

  if (devices && devices.length === 0) {
    devices = [
      { id: '/dev/null' },
    ]
  }

  const schemaWithoutDef = ({ schema }) => {
    const properties = { ...schema.properties }
    delete properties.machineDefinitionURL

    const required = schema.required.filter(fieldName => (
      fieldName !== 'machineDefinitionURL'
    ))

    return {
      ...schema,
      properties,
      required,
    }
  }

  configForm = configForm && {
    ...configForm,
    schema: transformComponentSchema({
      schema: schemaWithoutDef(configForm),
      materials: [],
      devices,
    })
  }

  return (
    <AddPrinterView
      loadingMachineSettings={loading}
      machineSettingsError={error}
      {...{
        mutation,
        configForm,
        onSubmit: ({ model }) => createMachine({
          variables: {
            input: {
              model,
            },
          },
        }),
      }}
    />
  )
}

export default AddPrinterPage
