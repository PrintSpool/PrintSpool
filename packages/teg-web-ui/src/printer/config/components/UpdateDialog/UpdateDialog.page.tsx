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

const SUBMIT_UPDATE_DIALOG = gql`
  mutation submitUpdateDialog($input: UpdateConfigInput!) {
    updateConfig(input: $input) {
      errors {
        dataPath
        message
      }
    }
  }
`

const UpdateDialogPage = ({
  title = null,
  collection,
  open,
  query,
  variables = {} as any,
  status,
  hasPendingUpdates = false,
  transformSchema = schema => schema,
  getConfigForm = null,
  onSubmit = null,
  deleteButton = false,
}) => {
  let history = useHistory()
  let { data, loading, error } = useQuery(query, {
    variables,
  })

  const [submitUpdateDialog, mutation] = useMutation(SUBMIT_UPDATE_DIALOG, {
    update: (mutationResult: any) => {
      if (mutationResult.data != null) {
        history.push('../')
      }
    },
  })

  if (error) {
    throw error
  }

  console.log({ title, open, status, loading, data })
  if (!open) return <div />
  if (loading || !data) return <div />

  if (mutation.error != null) {
    throw mutation.error
  }

  if (mutation.called) return <div />

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

  const input = {
    configFormID: data.id,
    modelVersion: data.modelVersion,
    machineID: variables.machineID,
    collection,
  }

  const viewOnSubmit = (model) => {
    if (onSubmit != null) {
      return onSubmit(model)
    }
    submitUpdateDialog({
      variables: {
        input: {
          ...input,
          model,
        },
      },
    })
  }

  const viewProps = {
    title,
    open,
    onSubmit: viewOnSubmit,
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
