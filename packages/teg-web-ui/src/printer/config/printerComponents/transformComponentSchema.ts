const transformComponentSchema = ({
  schema,
  materials = [],
  devices = [],
  videoSources = [],
  machineDefSuggestions = [],
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
  if (schema.properties.source != null && videoSources != null) {
    // inject the devices list into the schema as an enum
    const enumValues = videoSources
      // .filter(d => d.type === 'SERIAL_PORT')
      .map(d => d.id)

    if (enumValues.length === 0) {
      enumValues.push('')
    }

    const properties = { ...nextSchema.properties }
    properties.source = {
      ...nextSchema.properties.source,
      enum: enumValues,
    }

    nextSchema = {
      ...nextSchema,
      properties,
    }
  }
  if (schema.properties.materialID != null) {
    // inject the materials list into the schema as an enum
    const materialIDEnum = materials.map(material => ({
      'const': material.id,
      title: material.name,
    }))

    materialIDEnum.unshift({
      'const': 'NULL',
      title: 'None',
    })

    const materialID = {
      ...nextSchema.properties.materialID,
      default: 'NULL',
      oneOf: materialIDEnum,
    }

    nextSchema = {
      ...nextSchema,
      properties: {
        ...nextSchema.properties,
        materialID
      },
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
