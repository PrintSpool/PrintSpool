import reducer, { initialState } from './pluginManagerReducer'

import { MockConfig } from '../../config/types/Config'

import loadPlugins from '../sideEffects/loadPlugins'

import setConfig from '../../config/actions/setConfig'
import initializeConfig, { INITIALIZE_CONFIG } from '../../config/actions/initializeConfig'
import requestSetConfig, { REQUEST_SET_CONFIG } from '../../config/actions/requestSetConfig'

describe('configReducer', () => {
  describe(INITIALIZE_CONFIG, () => {
    it('sets the pluginLoader and requests that the configs be set', () => {
      const config = MockConfig()

      const action = initializeConfig({
        config,
        pluginLoader: 'test_loader',
      })

      const [
        nextState,
        { actionToDispatch: nextAction },
      ] = reducer(initialState, action)

      expect(nextState.pluginLoader).toEqual('test_loader')
      expect(nextAction).toEqual(requestSetConfig({ config }))
    })
  })
  describe(REQUEST_SET_CONFIG, () => {
    it('loads the plugins and sets the configs', () => {
      const config = MockConfig()

      const state = initialState.set('pluginLoader', 'test_loader')
      const action = requestSetConfig({ config })

      const [
        nextState,
        sideEffect,
      ] = reducer(state, action)

      expect(nextState).toEqual(state)
      expect(sideEffect.func).toEqual(loadPlugins)
      expect(sideEffect.args).toEqual([{
        pluginLoader: 'test_loader',
        config,
      }])
      expect(sideEffect.successActionCreator).toEqual(setConfig)
    })
  })
})
