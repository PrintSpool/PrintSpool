import {
  createMacroExpansionReducer,
} from '@tegh/core'

const meta = {
  package: '@tegh/macros-default',
  macro: 'toggleMotorsEnabled',
}

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
