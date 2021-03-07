import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { gql, useMutation } from '@apollo/client'

import CreateComponentDialogView from './CreateComponentDialog.view'
import useSchemaValidation from '../FormikSchemaForm/useSchemaValidation'

const CREATE_COMPONENT = gql`
  mutation createComponent($input: CreateComponentInput!) {
    createComponent(input: $input) {
      id
    }
  }
`

const createComponentDialog = ({
  open,
  fixedListComponentTypes,
  videoSources,
  devices,
  materials,
}) => {
  const { machineID } = useParams()
  const history = useHistory()

  const [wizard, updateWizard] = useState({
    activeStep: 0,
    schemaForm: { schema: null },
  })
  const { schema } = wizard.schemaForm
  const validate = useSchemaValidation({ schema })

  const [createComponent, mutation] = useMutation(CREATE_COMPONENT, {
    update: (mutationResult: any) => {
      if (mutationResult.data != null) {
        history.push('../')
      }
    }

  })

  if (mutation.called) return <div />

  return (
    <CreateComponentDialogView {...{
      machineID,
      open,
      error: mutation.error,
      history,
      create: createComponent,
      client: mutation.client,
      validate,
      wizard,
      updateWizard,
      fixedListComponentTypes,
      videoSources,
      devices,
      materials,
    }} />
  )
}

export default createComponentDialog
