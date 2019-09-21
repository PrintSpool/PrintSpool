// import getComponentsState from '../selectors/getComponentsState'
// import { FAN, TOOLHEAD } from '../../config/types/components/ComponentTypeEnum'
// import { NullSchemaForm } from '../../pluginManager/types/SchemaForm'
// import getAxePositions from '../selectors/getAxePositions'

const ComponentResolvers = {
  Component: {
    name: source => (
      // TODO: config-based fields
      // source.model.get('name')
      source.address
    ),
    configForm: (source, args, { store }) => {
      // TODO: config-based fields
      // const { id, model, modelVersion } = source

      // const state = store.getState()
      // const schemaForm = state.schemaForms.getIn(
      //   ['components', source.type],
      //   NullSchemaForm,
      // )

      // return {
      //   id,
      //   model,
      //   modelVersion,
      //   schemaForm,
      // }
    },
    toolhead: (source) => {
      // TODO: config-based fields: toolheads have materials assigned. TODO: isn't this too 3D printer specific?
      // if (source.type === TOOLHEAD) {
      //   return source
      // }

      // return null
    },
  },
}

export default ComponentResolvers
