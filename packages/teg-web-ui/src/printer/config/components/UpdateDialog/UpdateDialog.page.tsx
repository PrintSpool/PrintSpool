import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { gql, useMutation, useQuery } from '@apollo/client'
import { useForm } from 'react-hook-form'
import useSchemaValidation, { createValidate } from '../ConfigForm/useSchemaValidation'

import UpdateDialogView from './UpdateDialog.view'

export const UPDATE_DIALOG_FRAGMENT = gql`
  fragment UpdateDialogFragment on ConfigForm {
    id
    model
    modelVersion
    schemaForm {
      schema
      form
    }
  }
`

const loadConfigForm = ({ getConfigForm, data }) => {
  if (getConfigForm != null) {
    return getConfigForm(data)
  }

  if (data.materials != null) {
    return data.materials[0].configForm
  }

  if (data.users != null) {
    return data.users[0].configForm
  }

  if (data.invites != null) {
    return data.invites[0].configForm
  }

  const machine = data.machines[0]

  if (machine.configForm != null) {
    return machine.configForm
  }

  return (machine.plugins || machine.components)[0].configForm
}

export const useUpdateDialog = ({
  title = null,
  open,
  query,
  variables = {} as any,
  status,
  hasPendingUpdates = false,
  transformSchema = schema => schema,
  getConfigForm = null,
  updateMutation,
  onSubmit,
  deleteButton = false,
}) => {
  const history = useHistory()

  let { data, loading, error } = useQuery(query, {
    variables,
    // onCompleted: resetSchemaAndForm
  })

  if (error) {
    throw error
  }

  // console.log({ title, open, status, loading, data })
  if (!open) return null
  if (loading || !data) return null

  const configFormData = loadConfigForm({ getConfigForm, data })

  return {
    title,
    open,
    onSubmit: ({model}) => onSubmit(model),
    onClose: () => history.push('../'),
    configForm: configFormData,
    submitting: updateMutation.loading,
    status,
    deleteButton,
    transformSchema,
    hasPendingUpdates,
    mutation: updateMutation,
  }
}

const UpdateDialogPage = (props) => {
  const viewProps = useUpdateDialog(props)

  if (viewProps == null) {
    return <div/>
  }

  return (
    <UpdateDialogView
      {...viewProps}
    />
  )

}

export default UpdateDialogPage
