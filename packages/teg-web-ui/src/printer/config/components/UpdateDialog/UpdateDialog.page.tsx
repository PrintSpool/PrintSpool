import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { gql, useMutation, useQuery } from '@apollo/client'
import { useForm } from 'react-hook-form'
import useSchemaValidation, { createValidate } from '../FormikSchemaForm/useSchemaValidation'

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

const UpdateDialogPage = ({
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
  const [validate, setValidate] = useState(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    errors,
    setError,
  } = useForm({
    defaultValues: {},
    context: { validate },
    resolver: (data, { validate }) => validate(data),
  })

  let { data, loading, error } = useQuery(query, {
    variables,
    onCompleted: (data) => {
      const configFormData = loadConfigForm({ getConfigForm, data })
      const nextValidate = createValidate({ schema: configFormData.schemaForm.schema })

      setValidate(() => nextValidate)
      reset(configFormData.model)
    }
  })

  useEffect(() => {
    if (updateMutation.error && !updateMutation.loading) {
      setError('', {
        message: updateMutation.error.message,
      })
    }
  }, [updateMutation.loading])

  if (error) {
    throw error
  }

  // console.log({ title, open, status, loading, data })
  if (!open) return <div />
  if (loading || !data) return <div />

  const configFormData = loadConfigForm({ getConfigForm, data })

  const viewProps = {
    title,
    open,
    onSubmit: handleSubmit(onSubmit),
    onClose: () => history.push('../'),
    data: configFormData,
    submitting: updateMutation.loading,
    error: updateMutation.error,
    status,
    deleteButton,
    transformSchema,
    hasPendingUpdates,
    register,
    control,
    errors,
  }

  return (
    <UpdateDialogView
      {...viewProps}
    />
  )

}

export default UpdateDialogPage
