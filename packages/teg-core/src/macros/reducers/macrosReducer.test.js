import { List, Map } from 'immutable'

import reducer, { initialState } from './macrosReducer'

import { MockConfig } from '../../config/types/Config'

import setConfig, { SET_CONFIG } from '../../config/actions/setConfig'

describe('configReducer', () => {
  describe(SET_CONFIG, () => {
    it('sets the state', () => {
      const config = MockConfig()
        .setIn(['printer', 'plugins', 0, 'package'], 'myPlugin')
        .setIn(['printer', 'plugins', 0, 'model', 'macros'], List(['*']))
      const plugins = Map({
        myPlugin: {
          macros: () => [
            'myMacro',
          ],
        },
      })

      const action = setConfig({ config, plugins })

      const nextState = reducer(initialState, action)

      expect(nextState.enabledMacros.toJS()).toEqual([
        'myMacro',
      ])
    })
  })
})
