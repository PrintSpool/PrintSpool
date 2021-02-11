import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { gql, useMutation, useQuery } from '@apollo/client'

import CreateInviteDialogView from './CreateInviteDialog.view'
import useSchemaValidation from '../../components/FormikSchemaForm/useSchemaValidation'

const SCHEMA_QUERY = gql`
  query schemaQuery {
    inviteSchemaForm {
      id
      schema
      form
    }
  }
`

const CREATE_COMPONENT = gql`
  mutation createInvite($input: CreateComponentInput!) {
    createInvite(input: $input) {
      id
      inviteURL
    }
  }
`

const createInviteDialog = ({
  open,
}) => {
  const { machineID } = useParams()
  const history = useHistory()

  const [wizard, updateWizard] = useState({
    activeStep: 0,
  })

  useEffect(() => {
    updateWizard({
      activeStep: 0,
    })
  }, [open])

  const { data, loading, error: queryError } = useQuery(SCHEMA_QUERY, {
    // TODO: move variables to where query is called
    variables: {
      input: {
        collection: 'AUTH',
        schemaFormKey: 'invite',
      },
    },
  })
  const { schema, form } = data?.inviteSchemaForm || {}

  const validate = useSchemaValidation({ schema })

  const [createInvite, mutation] = useMutation(CREATE_COMPONENT, {
    update: (mutationResult: any) => {
      if (mutationResult.data != null) {
        setTimeout(() => updateWizard({ activeStep: 1 }), 0)
      }
    }
  })

  const anyError = queryError || mutation.error
  if (anyError != null) {
    throw anyError
  }

  if (loading) return <div />

  return (
    <CreateInviteDialogView {...{
      loading: mutation.loading,
      inviteURL: mutation.data?.createInvite.inviteURL,
      schema,
      form,
      machineID,
      open,
      history,
      create: createInvite,
      client: mutation.client,
      validate,
      wizard,
      updateWizard,
    }} />
  )
}

export default createInviteDialog
