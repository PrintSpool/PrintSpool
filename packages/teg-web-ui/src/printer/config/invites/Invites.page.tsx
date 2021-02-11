import React from 'react'
import { useParams, useHistory } from 'react-router'
import { gql, useMutation } from '@apollo/client'

import useDeleteConfig from '../components/useDeleteConfig'
import useLiveSubscription from '../../_hooks/useLiveSubscription'
import InvitesConfigView from './Invites.view'
import { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/UpdateDialog.page'

const CONFIG_QUERY = gql`
  fragment QueryFragment on Query {
    # hasPendingUpdates
    invites {
      id
      description
      createdAt
      isAdmin
      configForm {
        ...UpdateDialogFragment
      }
    }
  }
  ${UPDATE_DIALOG_FRAGMENT}
`
const UPDATE_INVITE = gql`
  mutation updateInvite($input: UpdateInviteInput!) {
    updateInvite(input: $input) {
      id
    }
  }
`

const DELETE_INVITE = gql`
  mutation deleteInvite($input: DeleteInviteInput!) {
    deleteInvite(input: $input) {
      id
    }
  }
`

const InvitesConfigIndex = () => {
  const history = useHistory()
  const { inviteID, ...params } = useParams()
  const verb = inviteID === 'new' ? 'new' : params.verb

  const { data, error, loading } = useLiveSubscription(CONFIG_QUERY)
  const { invites } = data || {}
  const invite = inviteID && invites?.find(m => m.id === inviteID)

  const [updateInvite, updateInviteMutation] = useMutation(UPDATE_INVITE, {
    update: (mutationResult: any) => {
      if (mutationResult.data != null) {
        history.push('../')
      }
    },
  })

  const update = (model) => {
    updateInvite({
      variables: {
        input: {
          inviteID,
          modelVersion: invite.configForm.modelVersion,
          model,
        }
      }
    })
  }

  useDeleteConfig(DELETE_INVITE, {
    variables: {
      input: {
        inviteID,
      },
    },
    show: inviteID != null && verb === 'delete',
    type: 'invite',
    title: inviteID,
  })

  if (loading) {
    return <div/>
  }

  const anyError = error || updateInviteMutation.error
  if (anyError) {
    throw anyError
  }

  return (
    <InvitesConfigView {...{
      inviteID,
      verb,
      invite,
      invites,
      hasPendingUpdates: false,
      update,
    }} />
  )
}

export default InvitesConfigIndex
