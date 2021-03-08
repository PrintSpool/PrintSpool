import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createValidate } from './useSchemaValidation'
import { ConfigFormContextType } from './ConfigForm'

export const useConfigForm = ({
  loading = false,
  schema: schemaOverride = null,
  configForm,
  mutation,
  defaultValues = {},
  afterValidate = ({ values, errors }) => ({ values, errors }),
}) => {
  const schema = schemaOverride || configForm?.schemaForm.schema

  const [validate, setValidate] = useState(() => (values) => ({ errors: {}, values }))

  const {
    register,
    control,
    handleSubmit,
    reset,
    errors,
    setError,
    formState,
  } = useForm({
    defaultValues,
    context: { validate },
    resolver: (values, { validate }) => validate(values),
  })

  useEffect(() => {
    if (loading || !configForm) return
    console.log('RESET!!!!!!', { loading, configForm })

    // Replace flat arrays so react-hook-form can use them
    const model = {}
    Object.entries(configForm.model).forEach(([k, v]) => {
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
    reset({ model })
  }, [loading, JSON.stringify(configForm?.model)])

  useEffect(() => {
    if (loading || !configForm) return

    // Install the schema validation rules
    const nextValidate = createValidate({ schema })
    const validateAndHooks = (values) => {
      const validationResult = nextValidate(values)
      return afterValidate(validationResult)
    }
    setValidate(() => validateAndHooks)
  }, [loading, JSON.stringify(configForm?.schemaForm)])

  useEffect(() => {
    if (mutation.error && !mutation.loading && formState.isSubmitted) {
      setError('' as never, {
        message: mutation.error.message,
      })
    }
  }, [mutation.loading, formState.isSubmitted])

  if (loading || !configForm || !validate) {
    return null
  }

  const { form } = configForm.schemaForm

  const context: ConfigFormContextType = {
    schema,
    form,
    register,
    control,
    errors,
    handleSubmit,
  }

  return context
}

export default useConfigForm
