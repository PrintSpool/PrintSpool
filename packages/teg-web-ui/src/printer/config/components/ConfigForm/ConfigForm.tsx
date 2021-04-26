import React from 'react'
import { gql } from '@apollo/client'

import useConfigForm from './useConfigForm'

export const CONFIG_FORM_FRAGMENT = gql`
  fragment ConfigFormFragment on ConfigForm {
    id
    model
    modelVersion
    schema
    form
    advancedForm
    developerForm
  }
`

export type ConfigFormContextType = {
  schema?: any,
  form?: any,
  advancedForm?: any,
  developerForm?: any,
  developerMode: boolean,
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
  developerMode,
  mutation,
  onSubmit,
  defaultValues = {},
  afterValidate = ({ values, errors }) => ({ values, errors }),
  children,
}) => {
  console.log('config form', { developerMode, configForm })
  const context = useConfigForm({
    loading,
    schema: schemaOverride,
    configForm,
    developerMode,
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

  const normalizedOnSubmit = (data) => {
    const model = { ...data.model }
    if (model.materialID === 'NULL') {
      model.materialID = null
    }

    onSubmit({
      ...data,
      model,
    })
  }

  return (
    <form onSubmit={handleSubmit(normalizedOnSubmit)}>
      <ConfigFormContext.Provider value={context} >
        { children }
      </ConfigFormContext.Provider>
    </form>
  )
}

export default ConfigForm
