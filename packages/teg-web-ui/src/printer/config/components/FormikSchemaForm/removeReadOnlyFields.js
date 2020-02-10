const removeReadOnlyFields = (model, schema) => {
  const nextModel = {}

  Object.entries(model).forEach(([key, value]) => {
    if (schema[key] && schema[key].readOnly !== true) {
      nextModel[key] = value
    }
  })

  return nextModel
}

export default removeReadOnlyFields
