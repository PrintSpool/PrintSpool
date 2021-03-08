import React from 'react'
import { gql } from '@apollo/client'

import useConfigForm from './useConfigForm'

export const CONFIG_FORM_FRAGMENT = gql`
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

export type ConfigFormContextType = {
  schema?: any,
  form?: any,
  register?: any,
  control?: any,
  errors?: any,
  handleSubmit?: any,
}

export const ConfigFormContext = React.createContext({} as ConfigFormContextType)

const ConfigForm = ({
  loading = false,
  schema: schemaOverride = null,
  configForm,
  mutation,
  onSubmit,
  defaultValues = {},
  afterValidate = ({ values, errors }) => ({ values, errors }),
  children,
}) => {
  const context = useConfigForm({
    loading,
    schema: schemaOverride,
    configForm,
    mutation,
    defaultValues,
    afterValidate,
  })
  const {
    handleSubmit
  } = context || {}

  if (context == null) {
    return <div/>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ConfigFormContext.Provider value={context} >
        { children }
      </ConfigFormContext.Provider>
    </form>
  )
}

export default ConfigForm
