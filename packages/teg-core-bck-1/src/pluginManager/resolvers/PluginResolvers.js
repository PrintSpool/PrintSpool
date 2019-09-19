import { NullSchemaForm } from '../types/SchemaForm'

const PluginResolvers = {
  Plugin: {
    configForm: (source, args, { store }) => {
      const { id, model, modelVersion } = source

      const state = store.getState()
      const schemaForm = state.schemaForms.getIn(
        ['plugins', source.package],
        NullSchemaForm,
      )

      return {
        id,
        model,
        modelVersion,
        schemaForm,
      }
    },
  },
}

export default PluginResolvers
