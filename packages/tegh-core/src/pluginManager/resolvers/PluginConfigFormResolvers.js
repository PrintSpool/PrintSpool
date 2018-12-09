import { NullSchemaForm } from '../types/SchemaForm'

const PluginConfigFormResolvers = {
  PluginConfigForm: {
    schemaForm: (source, args, { store }) => {
      const state = store.getState()
      return state.schemaForms.getIn(
        ['plugins', source.package],
        NullSchemaForm,
      )
    },
  },
}

export default PluginConfigFormResolvers
