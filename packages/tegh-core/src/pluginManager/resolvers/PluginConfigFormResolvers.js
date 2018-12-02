import { NullSchemaForm } from '../types/SchemaForm'

const PluginConfigFormResolvers = {
  PluginConfigForm: {
    schemaForm: (source, args, { store }) => {
      const state = store.getState()
      return state.schemaForms.get(source.package, NullSchemaForm)
    },
  },
}

export default PluginConfigFormResolvers
