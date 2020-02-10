const removeReadOnlyFields = (model, schema) => {
  const nextModel = {}

  Object.entries(model).forEach(([key, value]) => {
    const prop = schema.properties[key]

    if (prop && prop.readOnly !== true) {
      nextModel[key] = value
    }
  })

  return nextModel
}

export default removeReadOnlyFields
