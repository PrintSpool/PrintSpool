import {
  createMacroExpansionReducer,
  ComponentTypeEnum,
} from '@tegh/core'

const { FAN } = ComponentTypeEnum

const meta = {
  package: '@tegh/macros-default',
  macro: 'toggleFans',
}

// example useage: { toggleFans: { fans: { [id]: true } }}
const toggleFans = createMacroExpansionReducer(meta, (
  { fans },
  { config },
) => (
  Object.entries(fans).map(([address, { enable } = {}]) => {
    if (typeof enable !== 'boolean') {
      throw new Error(
        'toggleFan fans arg must be in the format '
        + '{ [address]: { enable: boolean } }'
        + ` received ${JSON.stringify(fans)}`,
      )
    }

    const component = config.printer.components.find(c => (
      c.model.get('address') === address
    ))

    if (component == null || component.type !== FAN) {
      throw new Error(`fan (${address}) does not exist`)
    }

    const macro = enable ? 'M106' : 'M107'

    const fanIndex = address.replace('f', '')

    return { [macro]: { p: fanIndex } }
  })
))

export default toggleFans
