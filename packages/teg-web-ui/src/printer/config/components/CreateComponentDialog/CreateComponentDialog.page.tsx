import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { gql, useMutation, useQuery } from '@apollo/client'

import CreateComponentDialogView from './CreateComponentDialog.view'

const GET_SCHEMA_FORM = gql`
  query GetSchemaForm($input: ComponentSchemaFormInput!) {
    componentSchemaForm(input: $input) {
      id
      schema
      form
    }
  }
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
  // videoSources,
  // devices,
  // materials,
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

  return (
    <CreateComponentDialogView {...{
      loading,
      // machineID,
      open,
      // error: mutation.error,
      history,
      // create: createComponent,
      // client: mutation.client,
      // validate,
      wizard: {
        ...wizard,
        activeStep: loading ? 0 : wizard.activeStep,
      },
      updateWizard,
      fixedListComponentTypes,
      mutation,
      configForm: {
        model: {},
        schemaForm: data?.componentSchemaForm,
      },
      onSubmit: ({ model }) => createComponent({
        variables: {
          input: {
            machineID,
            componentType: wizard.componentType,
            model,
          },
        },
      }),
      onCancel: () => history.push('../'),
    }} />
  )
}

export default CreateComponentDialog
