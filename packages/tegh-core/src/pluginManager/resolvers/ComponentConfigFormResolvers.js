import { NullSchemaForm } from '../types/SchemaForm'

const ComponentConfigFormResolvers = {
  ComponentConfigForm: {
    name: source => source.model.get('name'),
    schemaForm: (source, args, { store }) => {
      const state = store.getState()
      return state.schemaForms.getIn(
        ['components', source.type],
        NullSchemaForm,
      )
    },
  },
}

export default ComponentConfigFormResolvers
