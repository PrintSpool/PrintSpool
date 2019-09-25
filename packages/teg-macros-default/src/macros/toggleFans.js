import {
  ComponentTypeEnum,
} from '@tegapp/core'

const { FAN } = ComponentTypeEnum

// example useage: { toggleFans: { fans: { [id]: true } }}
const compileToggleFans = ({
  args: { fans },
  machineConfig,
}) => {
  const commands = Object.entries(fans).map(([address, { enable } = {}]) => {
    if (typeof enable !== 'boolean') {
      throw new Error(
        'toggleFan fans arg must be in the format '
        + '{ [address]: { enable: boolean } }'
        + ` received ${JSON.stringify(fans)}`,
      )
    }

    const component = machineConfig.components.find(c => (
      c.model.get('address') === address
    ))

    if (component == null || component.type !== FAN) {
      throw new Error(`fan (${address}) does not exist`)
    }

    const macro = enable ? 'M106' : 'M107'

    const fanIndex = address.replace('f', '')

    return { [macro]: { p: fanIndex } }
  })

  return { commands }
}

const toggleFansMacro = {
  key: 'toggleFans',
  schema: {
    type: 'object',
    properties: {
      fans: {
        type: 'object',
        additionalProperties: {
          type: 'boolean',
        },
      },
    },
  },
  compile: compileToggleFans,
}

export default toggleFansMacro
