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
    // onCompleted: resetSchemaAndForm
  })

  useEffect(() => {
    if (loading || !data) return

    const configFormData = loadConfigForm({ getConfigForm, data })
    const { schema } = configFormData.schemaForm

    // Install the schema validation rules
    const nextValidate = createValidate({ schema })
    setValidate(() => nextValidate)

    // Replace flat arrays so react-hook-form can use them
    const model = {}
    Object.entries(configFormData.model).forEach(([k, v]) => {
      const property = schema.properties[k]
      // console.log({ property })
      if (
        property.type === 'array'
        && property.items.type !== 'object'
      ) {
        // console.log({ v })
        model[k] = (v||[] as any).map(value => ({ value }))
      } else {
        model[k] = v
      }
    })
    // console.log({ model })
    reset(model)
  }, [loading, data])

  useEffect(() => {
    if (updateMutation.error && !updateMutation.loading) {
      setError('' as never, {
        message: updateMutation.error.message,
      })
    }
  }, [updateMutation.loading])

  if (error) {
    throw error
  }

  // console.log({ title, open, status, loading, data })
  if (!open) return null
  if (loading || !data || !validate) return null

  const configFormData = loadConfigForm({ getConfigForm, data })

  return {
    title,
    open,
    onSubmit: handleSubmit(onSubmit),
    onClose: () => history.push('../'),
    data: configFormData,
    submitting: updateMutation.loading,
    status,
    deleteButton,
    transformSchema,
    hasPendingUpdates,
    register,
    control,
    errors,
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
