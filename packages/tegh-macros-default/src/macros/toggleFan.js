import {
  createMacroExpansionReducer,
  ComponentTypeEnum,
} from '@tegh/core'

const { FAN } = ComponentTypeEnum

const meta = {
  package: '@tegh/macros-default',
  macro: 'toggleFan',
}

const toggleFan = createMacroExpansionReducer(meta, (
  args,
  { config },
) => (
  Object.entries(args).map(([id, { enable } = {}]) => {
    if (typeof enable !== 'boolean') {
      throw new Error(
        'toggleFan args must be in the format { [id]: { enable: boolean } }'
        + ` received ${JSON.stringify(args)}`,
      )
    }
    const component = config.printer.components.find(c => c.id === id)

    if (component == null || component.type !== FAN) {
      throw new Error(`fan (${id}) does not exist`)
    }

    const macro = enable ? 'M106' : 'M107'

    return `${macro} P${component.model.get('address').replace('f', '')}`
  })
))

export default toggleFan
