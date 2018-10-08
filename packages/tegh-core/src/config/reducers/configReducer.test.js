import reducer, { initialState } from './configReducer'

import setConfig, { SET_CONFIG } from '../actions/setConfig'

describe('configReducer', () => {
  describe(SET_CONFIG, () => {
    it('sets the state', () => {
      const action = setConfig({ config: 'test_config', plugins: null })

      const nextState = reducer(initialState, action)

      expect(nextState).toEqual('test_config')
    })
  })
})
