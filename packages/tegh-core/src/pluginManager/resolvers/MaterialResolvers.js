import { NullSchemaForm } from '../types/SchemaForm'

const MaterialFormResolvers = {
  Material: {
    model: source => source,
    schemaForm: (source, args, { store }) => {
      const state = store.getState()
      return state.schemaForms.get(source.type, NullSchemaForm)
    },
    shortSummary: source => `${source.targetExtruderTemperature}°`,
  },
}

export default MaterialFormResolvers
