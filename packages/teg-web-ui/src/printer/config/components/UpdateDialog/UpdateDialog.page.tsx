import React from 'react'
import { useHistory } from 'react-router'
import { useQuery } from '@apollo/client'

import UpdateDialogView from './UpdateDialog.view'
import { CONFIG_FORM_FRAGMENT } from '../ConfigForm/ConfigForm'

export const UPDATE_DIALOG_FRAGMENT = CONFIG_FORM_FRAGMENT

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

type UpdateDialogProps = {
  title?: string,
  open: boolean,
  query: any,
  variables?: any,
  status?: any,
  hasPendingUpdates?: boolean,
  transformSchema?: any,
  getConfigForm?: any,
  updateMutation: any,
  onSubmit: any,
  deleteButton?: boolean,
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
}: UpdateDialogProps) => {
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

const UpdateDialogPage = (props: UpdateDialogProps) => {
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
