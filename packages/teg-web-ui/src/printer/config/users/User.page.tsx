import React from 'react'
import { useParams, useHistory } from 'react-router'
import { gql, useMutation } from '@apollo/client'

import useDeleteConfig from '../components/useDeleteConfig'
import useLiveSubscription from '../../_hooks/useLiveSubscription'
import UsersConfigView from './Users.view'
import { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/UpdateDialog.page'

const CONFIG_QUERY = gql`
  fragment QueryFragment on Query {
    # hasPendingUpdates
    users {
      id
      description
      isAdmin
      isLocalHTTPUser
      picture
      createdAt
      configForm {
        ...ConfigFormFragment
      }
    }
  }
  ${UPDATE_DIALOG_FRAGMENT}
`

const UPDATE_USER = gql`
  mutation updateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
    }
  }
`

const DELETE_USER = gql`
  mutation deleteUser($input: DeleteUserInput!) {
    deleteUser(input: $input) {
      id
    }
  }
`

const UsersConfigIndex = () => {
  const history = useHistory()
  const { userID, ...params } = useParams()
  const verb = userID === 'new' ? 'new' : params.verb

  const { data, error, loading } = useLiveSubscription(CONFIG_QUERY)
  const { users } = data || {}
  const user = userID && users?.find(m => m.id === userID)

  const [updateUser, updateUserMutation] = useMutation(UPDATE_USER, {
    update: (mutationResult: any) => {
      if (mutationResult.data != null) {
        history.push('../')
      }
    },
  })

  const update = (model) => {
    updateUser({
      variables: {
        input: {
          userID,
          modelVersion: user.configForm.modelVersion,
          model,
        }
      }
    })
  }

  useDeleteConfig(DELETE_USER, {
    variables: {
      input: {
        userID,
      },
    },
    show: userID != null && verb === 'delete',
    type: 'user',
    title: user?.description,
  })

  if (loading) {
    return <div/>
  }

  if (error) {
    throw error
  }

  return (
    <UsersConfigView {...{
      userID,
      verb,
      users,
      user,
      hasPendingUpdates: false,
      update,
      updateMutation: updateUserMutation,
    }} />
  )
}

export default UsersConfigIndex
