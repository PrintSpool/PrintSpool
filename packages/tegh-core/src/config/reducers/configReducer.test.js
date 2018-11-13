import { List } from 'immutable'

import reducer, { initialState } from './configReducer'

import { MockConfig } from '../types/Config'

import setConfig, { SET_CONFIG } from '../actions/setConfig'
import requestSetConfig from '../actions/requestSetConfig'
import requestPatchPrinterConfig, { REQUEST_PATCH_PRINTER_CONFIG } from '../actions/requestPatchPrinterConfig'

describe('configReducer', () => {
  describe(SET_CONFIG, () => {
    it('sets the state', () => {
      const config = MockConfig()
      const action = setConfig({ config, plugins: List() })

      const nextState = reducer(initialState, action)

      expect(nextState).toEqual(config)
    })
  })
  describe(REQUEST_PATCH_PRINTER_CONFIG, () => {
    fit('creates a REQUEST_SET_CONFIG with the patched config', () => {
      const state = MockConfig()
      const action = requestPatchPrinterConfig({
        patch: [
          { op: 'replace', path: '/name', value: 'my_new_printer_name_102' },
        ],
      })

      const [
        nextState,
        { actionToDispatch: nextAction },
      ] = reducer(state, action)

      expect(nextState).toEqual(state)
      expect(nextAction).toEqual(
        requestSetConfig({
          config: state.set('printer', 'name', 'my_new_printer_name_102'),
        }),
      )
    })
  })
})
