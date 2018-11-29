import { NullSchemaForm } from '../types/SchemaForm'

const MaterialFormResolvers = {
  MaterialForm: {
    model: source => source,
    schemaForm: (source, args, { store }) => {
      const state = store.getState()
      return state.schemaForms.get(source.type, NullSchemaForm)
    },
  },
}

export default MaterialFormResolvers
