import { NullSchemaForm } from '../../pluginManager/types/SchemaForm'

const ConfigFormResolvers = {
  ConfigForm: {
    model: source => source,
    schemaForm: (source, args, { store }) => {
      const state = store.getState()
      const type = source.type || source.package
      return state.schemaForms.get(type, NullSchemaForm)
    },
  },
}

export default ConfigFormResolvers
