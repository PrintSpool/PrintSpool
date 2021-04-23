import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { gql, useMutation, useQuery } from '@apollo/client'

import CreateComponentDialogView from './CreateComponentDialog.view'
import { CONFIG_FORM_FRAGMENT } from '../ConfigForm/ConfigForm'

const GET_SCHEMA_FORM = gql`
  query GetConfigForm($input: ComponentSchemaFormInput!) {
    componentConfigForm(input: $input) {
      ...ConfigFormFragment
    }
  }
  ${CONFIG_FORM_FRAGMENT}
`

const CREATE_COMPONENT = gql`
  mutation createComponent($input: CreateComponentInput!) {
    createComponent(input: $input) {
      id
    }
  }
`

const CreateComponentDialog = ({
  open,
  fixedListComponentTypes,
  transformSchema,
}) => {
  const { machineID } = useParams()
  const history = useHistory()

  const [wizard, updateWizard] = useState({
    activeStep: 0,
    componentType: null,
  })

  const { data, loading, error } = useQuery(GET_SCHEMA_FORM, {
    skip: wizard.activeStep < 1,
    variables: {
      input: {
        machineID,
        type: wizard.componentType,
      }
    }
  })

  const [createComponent, mutation] = useMutation(CREATE_COMPONENT, {
    update: (mutationResult: any) => {
      if (mutationResult.data != null) {
        history.push('../')
      }
    }
  })

  if (error) {
    throw error
  }

  const { schema, ...configForm } = data?.componentConfigForm || {}

  return (
    <CreateComponentDialogView {...{
      loading,
      open,
      history,
      wizard: {
        ...wizard,
        activeStep: loading ? 0 : wizard.activeStep,
      },
      updateWizard,
      fixedListComponentTypes,
      mutation,
      configForm: {
        ...configForm,
        schema: schema && transformSchema(schema),
      },
      onSubmit: ({ model }) => {
        createComponent({
          variables: {
            input: {
              machineID,
              componentType: wizard.componentType,
              model,
            },
          },
        })
      },
      onCancel: () => history.push('../'),
    }} />
  )
}

export default CreateComponentDialog
