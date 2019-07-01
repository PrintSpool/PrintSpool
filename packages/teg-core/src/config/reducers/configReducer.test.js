import { List } from 'immutable'

import reducer, { initialState } from './configReducer'

import { MockConfig } from '../types/Config'

import setConfig, { SET_CONFIG } from '../actions/setConfig'

describe('configReducer', () => {
  describe(SET_CONFIG, () => {
    it('sets the state', () => {
      const config = MockConfig()
      const action = setConfig({ config, plugins: List() })

      const nextState = reducer(initialState, action)

      expect(nextState).toEqual(config)
    })
  })
})
