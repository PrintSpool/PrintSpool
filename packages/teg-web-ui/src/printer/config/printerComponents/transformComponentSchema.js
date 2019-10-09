const transformComponentSchema = ({
  schema,
  materials,
  devices,
  machineDefSuggestions,
}) => {
  let nextSchema = schema
  if (schema.properties.serialPortID != null) {
    // inject the devices list into the schema as an enum
    const enumValues = devices
      // .filter(d => d.type === 'SERIAL_PORT')
      .map(d => d.id)

    const properties = { ...nextSchema.properties }
    properties.serialPortID = {
      ...nextSchema.properties.serialPortID,
      enum: enumValues,
    }

    nextSchema = {
      ...nextSchema,
      properties,
    }
  }
  if (schema.properties.materialID != null) {
    // inject the materials list into the schema as an enum
    const enumValues = materials.map(m => m.id)
    const enumNames = materials.map(m => m.name)

    const properties = { ...nextSchema.properties }
    properties.materialID = {
      ...nextSchema.properties.materialID,
      enum: enumValues,
      enumNames,
    }

    nextSchema = {
      ...nextSchema,
      properties,
    }
  }
  if (schema.properties.machineDefinitionURL != null) {
    const properties = { ...nextSchema.properties }
    properties.machineDefinitionURL = {
      ...nextSchema.properties.machineDefinitionURL,
      suggestions: machineDefSuggestions,
    }

    nextSchema = {
      ...nextSchema,
      properties,
    }
  }
  return nextSchema
}

export default transformComponentSchema
