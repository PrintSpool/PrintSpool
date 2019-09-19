import { NullSchemaForm } from '../types/SchemaForm'

const MaterialFormResolvers = {
  Material: {
    configForm: (source, args, { store }) => {
      const { id, model, modelVersion } = source

      const state = store.getState()
      const schemaForm = state.schemaForms.getIn(
        ['materials', source.type],
        NullSchemaForm,
      )

      return {
        id,
        model,
        modelVersion,
        schemaForm,
      }
    },
    name: source => source.model.get('name'),
    shortSummary: source => `${source.model.get('targetExtruderTemperature')}°`,
  },
}

export default MaterialFormResolvers
