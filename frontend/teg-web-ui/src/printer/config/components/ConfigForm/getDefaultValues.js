const getDefaultValues = ({ schema }) => {
  const defaultValues = {}
  Object.entries(schema.properties).forEach(([name, property]) => {
    defaultValues[name] = property.default
  })
  return defaultValues
}

export default getDefaultValues
