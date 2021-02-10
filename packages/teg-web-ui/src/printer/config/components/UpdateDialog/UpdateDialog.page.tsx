import React from 'react'
import { useHistory } from 'react-router'
import { gql, useMutation, useQuery } from '@apollo/client'

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

const UpdateDialogPage = ({
  title = null,
  open,
  query,
  variables = {} as any,
  status,
  hasPendingUpdates = false,
  transformSchema = schema => schema,
  getConfigForm = null,
  onSubmit,
  deleteButton = false,
}) => {
  let history = useHistory()
  let { data, loading, error } = useQuery(query, {
    variables,
  })

  if (error) {
    throw error
  }

  // console.log({ title, open, status, loading, data })
  if (!open) return <div />
  if (loading || !data) return <div />

  let configFormData

  if (getConfigForm == null) {
    configFormData = (() => {
      if (data.materials != null) {
        return data.materials[0].configForm
      }

      const machine = data.machines[0]

      if (machine.configForm != null) {
        return machine.configForm
      }

      return (machine.plugins || machine.components)[0].configForm
    })()
  } else {
    configFormData = getConfigForm(data)
  }

  const viewProps = {
    title,
    open,
    onSubmit,
    onClose: () => history.push('../'),
    data: configFormData,
    status,
    deleteButton,
    transformSchema,
    hasPendingUpdates,
  }

  return (
    <UpdateDialogView
      {...viewProps}
    />
  )

}

export default UpdateDialogPage
