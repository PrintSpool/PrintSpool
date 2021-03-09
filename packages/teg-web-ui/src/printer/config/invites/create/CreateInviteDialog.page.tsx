import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router'
import { gql, useMutation, useQuery } from '@apollo/client'

import CreateInviteDialogView from './CreateInviteDialog.view'
import { CONFIG_FORM_FRAGMENT } from '../../components/ConfigForm/ConfigForm'

const SCHEMA_QUERY = gql`
  query configFormQuery {
    inviteConfigForm {
      ...ConfigFormFragment
    }
  }
  ${CONFIG_FORM_FRAGMENT}
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
  const history = useHistory()

  const [wizard, updateWizard] = useState({
    activeStep: 0,
  })

  useEffect(() => {
    updateWizard({
      activeStep: 0,
    })
  }, [open])

  const { data, loading, error } = useQuery(SCHEMA_QUERY)

  const [createInvite, mutation] = useMutation(CREATE_COMPONENT, {
    update: (mutationResult: any) => {
      if (mutationResult.data != null) {
        setTimeout(() => {
          updateWizard({ activeStep: 1 })
        }, 0)
      }
    }
  })

  if (error != null) {
    throw error
  }

  if (loading) return <div />

  return (
    <CreateInviteDialogView {...{
      loading: mutation.loading,
      open,
      inviteURL: mutation.data?.createInvite.inviteURL,
      wizard,
      updateWizard,
      mutation,
      configForm: data?.inviteConfigForm,
      onSubmit: ({ model }) => createInvite({
        variables: {
          input: {
            model,
          },
        },
      }),
      onCancel: () => history.push('../'),
    }} />
  )
}

export default createInviteDialog
