import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { gql, useMutation } from '@apollo/client'

import CreateMaterialDialogView from './CreateMaterialDialog.view'
import useSchemaValidation from '../ConfigForm/useSchemaValidation'

const CREATE_COMPONENT = gql`
  mutation createMaterial($input: CreateComponentInput!) {
    createMaterial(input: $input) {
      id
    }
  }
`

const createMaterialDialog = ({
  open,
}) => {
  const { machineID } = useParams()
  const history = useHistory()

  const [wizard, updateWizard] = useState({
    activeStep: 0,
    schemaForm: { schema: null },
  })
  const { schema } = wizard.schemaForm
  const validate = useSchemaValidation({ schema })

  const [createMaterial, mutation] = useMutation(CREATE_COMPONENT, {
    update: (mutationResult: any) => {
      if (mutationResult.data != null) {
        history.push('../')
      }
    }
  })

  const anyError = mutation.error
  if (anyError != null) {
    throw anyError
  }

  if (mutation.called) return <div />

  return (
    <CreateMaterialDialogView {...{
      machineID,
      open,
      history,
      create: createMaterial,
      client: mutation.client,
      validate,
      wizard,
      updateWizard,
    }} />
  )
}

export default createMaterialDialog
