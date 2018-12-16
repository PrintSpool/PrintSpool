import { List, Map } from 'immutable'

import createMacroExpansionReducer, { initialState } from './createMacroExpansionReducer'

import { MockConfig } from '../../config/types/Config'

import setConfig, { SET_CONFIG } from '../../config/actions/setConfig'

const meta = {
  package: 'tegh-example-package',
  macro: 'doExample',
}
const macroFn = (args) => args

const reducer = createMacroExpansionReducer(meta, macroFn)

const enabledConfig = MockConfig()
  .setIn(['printer', 'plugins', 0, 'package'], 'tegh-example-package')
  .setIn(['printer', 'plugins', 0, 'model', 'macros'], List(['*']))
const plugins = Map({
  'tegh-example-package': {
    macros: () => [
      'doExample',
    ],
  },
})

const disabledConfig = enabledConfig
  .setIn(['printer', 'plugins', 0, 'model', 'macros'], List(['other']))

describe('createMacroExpansionReducer', () => {
  describe(SET_CONFIG, () => {
    it('sets enabled to true if the macro is enabled', () => {
      const action = setConfig({
        config: enabledConfig,
        plugins,
      })

      const nextState = reducer(initialState, action)

      expect(nextState.enabled).toEqual(true)
      expect(nextState.config).toEqual(enabledConfig)
    })
    it('sets enabled to false if the macro is disabled', () => {
      const action = setConfig({
        config: disabledConfig,
        plugins,
      })

      const nextState = reducer(initialState, action)

      expect(nextState.enabled).toEqual(false)
    })
  })
})
