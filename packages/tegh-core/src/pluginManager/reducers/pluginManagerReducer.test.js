import reducer, { initialState } from './pluginManagerReducer'

import { MockConfig } from '../../config/types/Config'

import loadPlugins from '../sideEffects/loadPlugins'

import setConfig, { SET_CONFIG } from '../../config/actions/setConfig'
import initializeConfig, { INITIALIZE_CONFIG } from '../../config/actions/initializeConfig'
import requestSetConfig, { REQUEST_SET_CONFIG } from '../../config/actions/requestSetConfig'

describe('configReducer', () => {
  describe(INITIALIZE_CONFIG, () => {
    it('sets the pluginLoaderPath and requests that the configs be set', () => {
      const config = MockConfig()

      const action = initializeConfig({
        config,
        pluginLoaderPath: 'test_path',
      })

      const [
        nextState,
        { actionToDispatch: nextAction },
      ] = reducer(initialState, action)

      expect(nextState.pluginLoaderPath).toEqual('test_path')
      expect(nextAction).toEqual(requestSetConfig({ config }))
    })
  })
  describe(REQUEST_SET_CONFIG, () => {
    it('loads the plugins and sets the configs', () => {
      const config = MockConfig()

      const state = initialState.set('pluginLoaderPath', 'test_path')
      const action = requestSetConfig({ config })

      const [
        nextState,
        sideEffect,
      ] = reducer(state, action)

      expect(nextState).toEqual(state)
      expect(sideEffect.func).toEqual(loadPlugins)
      expect(sideEffect.args).toEqual([{
        pluginLoaderPath: 'test_path',
        config,
      }])
      expect(sideEffect.successActionCreator).toEqual(setConfig)
    })
  })
})
