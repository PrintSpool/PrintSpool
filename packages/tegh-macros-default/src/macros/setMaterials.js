import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'

import {
  ComponentTypeEnum,
  despoolCompleted,
  SET_CONFIG,
  DESPOOL_TASK,
  isMacroEnabled,
  setToolheadMaterials,
} from '@tegh/core'

const { TOOLHEAD } = ComponentTypeEnum

const meta = {
  package: '@tegh/macros-default',
  macro: 'setMaterials',
}

export const initialState = Record({
  config: null,
  enabled: false,
})()

// example usage: { setMaterials: { toolheads: { e0: exampleMaterialID } } }
const setMaterials = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload
      const enabled = isMacroEnabled({ config, meta })

      return state.merge({
        config,
        enabled,
      })
    }
    case DESPOOL_TASK: {
      const { macro, args, task } = action.payload

      if (macro !== meta.macro || !state.enabled) {
        return state
      }

      const { config } = state
      const { toolheads } = args

      let nextConfig = state.config

      Object.entries(toolheads).forEach(([address, materialID]) => {
        const [index, component] = config.printer.components.findEntry(c => (
          c.model.get('address') === address
        ))

        const material = config.materials.find(m => m.id === materialID)

        if (component == null || component.type !== TOOLHEAD) {
          throw new Error(`Toolhead (${address}) does not exist`)
        }

        if (material == null) {
          throw new Error(`Material (${materialID}) does not exist`)
        }

        nextConfig = nextConfig.setIn(
          ['printer', 'components', index, 'model', 'materialID'],
          materialID,
        )
      })

      return loop(
        state,
        Cmd.list([
          Cmd.action(setToolheadMaterials({
            config: nextConfig,
          })),
          Cmd.action(despoolCompleted({ task })),
        ]),
      )
    }
    default: {
      return state
    }
  }
}

export default setMaterials
