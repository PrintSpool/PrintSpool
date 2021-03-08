import React, { useState } from 'react'
import { useHistory } from 'react-router'
import { gql, useMutation, useQuery } from '@apollo/client'

import CreateMaterialDialogView from './CreateMaterialDialog.view'

const GET_SCHEMA_FORM = gql`
  query GetSchemaForm($input: MaterialSchemaFormInput!) {
    materialSchemaForm(input: $input) {
      id
      schema
      form
    }
  }
`

const CREATE_MATERIAL = gql`
  mutation createMaterial($input: CreateComponentInput!) {
    createMaterial(input: $input) {
      id
    }
  }
`

const createMaterialDialog = ({
  open,
}) => {
  const history = useHistory()

  const [wizard, updateWizard] = useState({
    activeStep: 0,
    materialType: null,
  })

  const { data, loading, error } = useQuery(GET_SCHEMA_FORM, {
    skip: wizard.activeStep < 1,
    variables: {
      input: {
        type: wizard.materialType,
      }
    }
  })

  const [createMaterial, mutation] = useMutation(CREATE_MATERIAL, {
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
    <CreateMaterialDialogView {...{
      loading,
      open,
      history,
      wizard: {
        ...wizard,
        activeStep: loading ? 0 : wizard.activeStep,
      },
      updateWizard,
      mutation,
      configForm: {
        model: {},
        schemaForm: data?.materialSchemaForm,
      },
      onSubmit: ({ model }) => createMaterial({
        variables: {
          input: {
            materialType: wizard.materialType,
            model,
          },
        },
      }),
      onCancel: () => history.push('../'),
    }} />
  )
}

export default createMaterialDialog
