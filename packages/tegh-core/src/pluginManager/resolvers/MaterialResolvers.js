import { NullSchemaForm } from '../types/SchemaForm'

const MaterialFormResolvers = {
  Material: {
    model: source => source.model,
    schemaForm: (source, args, { store }) => {
      const state = store.getState()
      return state.schemaForms.get(source.type, NullSchemaForm)
    },
    name: source => source.model.get('name'),
    shortSummary: source => `${source.model.get('targetExtruderTemperature')}°`,
  },
}

export default MaterialFormResolvers
