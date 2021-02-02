import React from 'react'
import { useHistory } from 'react-router-dom'
import { useAsync } from 'react-async'

import { useQuery, useApolloClient } from '@apollo/client'
import { gql } from '@apollo/client'

import { useDelete } from '../components/useDeleteConfig'
import Loading from '../../../common/Loading'
import InvitesView from './Invites.view'

const InvitesQuery = gql`
  query InvitesQuery {
    hasPendingUpdates
    invites {
      id
      createdAt
      isAdmin
    }
  }
`

const updateInvite = gql`
  mutation updateInvite($input: UpdateInviteInput!) {
    updateInvite(input: $input) {
      errors {
        message
      }
    }
  }
`

const deleteInviteMutation = gql`
  mutation deleteInvite($input: DeleteInviteInput!) {
    deleteInvite(input: $input)
  }
`

const InvitesPage = ({
  match,
}) => {
  // InvitesQuery
  const { inviteID, verb } = match.params

  const history = useHistory()
  const apollo = useApolloClient()

  const { data, loading, error } = useQuery(InvitesQuery, {
    pollInterval: 1000,
  })

  const { hasPendingUpdates, invites = [] } = data || {}
  const selectedInvite = invites.find(c => c.id === inviteID)

  const deleteInvite = useAsync({
    deferFn: async () => {
      await apollo.mutate({
        mutation: deleteInviteMutation,
        variables: {
          input: {
            inviteID: selectedInvite.id,
          },
        },
      })
      history.push('../')
    },
  })

  if (deleteInvite.error) {
    throw deleteInvite.error
  }

  if (error) {
    throw new Error(JSON.stringify(error))
  }

  const onUpdate = async (model) => {
    console.log({ model })
    const { data: { errors } } = await apollo.mutate({
      mutation: updateInvite,
      variables: {
        input: {
          inviteID: selectedInvite.id,
          ...model,
        },
      },
    })
    if (errors) {
      throw new Error(JSON.stringify(errors))
    }
    history.push('../')
  }

  useDelete({
    fn: deleteInvite.run,
    show: selectedInvite != null && verb === 'delete',
    type: 'invite',
    title: 'Invite',
  })

  if (loading) {
    return <Loading />
  }

  return (
    <InvitesView {...{
      invites,
      inviteID,
      selectedInvite,
      verb,
      hasPendingUpdates,
      onUpdate,
      deleteInvite,
    }}
    />
  )
}

export default InvitesPage
// export default () => <div>WAT</div>
