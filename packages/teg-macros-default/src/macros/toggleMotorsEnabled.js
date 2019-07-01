import {
  createMacroExpansionReducer,
} from '@tegapp/core'

const meta = {
  package: '@tegapp/macros-default',
  macro: 'toggleMotorsEnabled',
}

// example useage: { toggleMotorsEnabled: { enable: true } }
const toggleMotorsEnabled = createMacroExpansionReducer(meta, (
  args,
) => {
  if (!args || typeof args.enable !== 'boolean') {
    throw new Error('toggleMotorsEnabled requires a boolean enable argument')
  }

  if (args.enable === true) return ['M17']
  if (args.enable === false) return ['M18']
})

export default toggleMotorsEnabled
