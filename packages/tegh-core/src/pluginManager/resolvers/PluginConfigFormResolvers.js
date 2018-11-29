import { NullSchemaForm } from '../types/SchemaForm'

const PluginConfigFormResolvers = {
  PluginConfigForm: {
    model: source => source,
    schemaForm: (source, args, { store }) => {
      const state = store.getState()
      return state.schemaForms.get(source.package, NullSchemaForm)
    },
  },
}

export default PluginConfigFormResolvers
