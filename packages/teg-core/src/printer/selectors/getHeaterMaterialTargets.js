import { createSelector } from 'reselect'

import getHeaterConfigs from '../../config/selectors/getHeaterConfigs'
import getMaterialForToolhead from './getMaterialForToolhead'

import { TOOLHEAD, BUILD_PLATFORM } from '../../config/types/components/ComponentTypeEnum'

const getHeaterMaterialTargets = createSelector(
  configPair => configPair,
  ({ machineConfig, combinatorConfig }) => {
    const heaters = getHeaterConfigs(machineConfig)

    return heaters.mapEntries(([id, heater]) => {
      switch (heater.type) {
        case TOOLHEAD: {
          const material = getMaterialForToolhead({ toolhead: heater, combinatorConfig })
          const target = material.model.get('targetExtruderTemperature')

          return [id, target]
        }
        case BUILD_PLATFORM: {
          // set the target bed temperature to the lowest bed temperature of
          // the materials loaded in the extruders
          const target = heaters.toList()
            .filter(h => h.type === TOOLHEAD)
            .map(t => (
              getMaterialForToolhead({ toolhead: t, combinatorConfig })
                .model
                .get('targetBedTemperature')
            ))
            .min()

          return [id, target]
        }
        default: {
          throw new Error(`Unsupported heater type: ${heater.type}`)
        }
      }
    })
  },
)

export default getHeaterMaterialTargets
