import {
  getHeaterConfigs,
  ComponentTypeEnum,
} from '@tegapp/core'

const { BUILD_PLATFORM } = ComponentTypeEnum

// example useage:
// { setTargetTemperature: { heaters: { e0: 220 }, sync: true } }
export const compileSetTargetTemperatures = ({
  args: { heaters, sync },
  machineConfig,
}) => {
  const commands = []

  Object.entries(heaters).forEach(([address, v]) => {
    const heater = getHeaterConfigs(machineConfig).find(h => (
      h.model.get('address') === address
    ))

    if (heater == null) {
      throw new Error(`Heater ${address} does not exist`)
    }
    if (typeof v !== 'number') {
      throw new Error(`${address}: ${v} is not a number`)
    }

    if (heater.type === BUILD_PLATFORM) {
      commands.push({ m140: { s: v } })
    } else {
      const extruderNumber = parseFloat(address.slice(1))
      commands.push({ m104: { s: v, t: extruderNumber } })
    }
  })

  if (sync) {
    commands.push('M109')
  }

  return {
    commands,
  }
}

const setTargetTemperatureMacro = {
  key: 'setTargetTemperatures',
  schema: {
    type: 'object',
    required: ['heaters'],
    properties: {
      heaters: {
        type: 'object',
        additionalProperties: {
          type: 'number',
        },
      },
      sync: {
        type: 'boolean',
      },
    },
  },
  compile: compileSetTargetTemperatures,
}

export default setTargetTemperatureMacro
