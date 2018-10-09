import { Map } from 'immutable'

import reducer, { initialState } from './macrosReducer'

import { MockConfig } from '../../config/types/Config'

import setConfig, { SET_CONFIG } from '../../config/actions/setConfig'
import spoolMacro, { SPOOL_MACRO } from '../../spool/actions/spoolMacro'
import spoolTask from '../../spool/actions/spoolTask'

describe('configReducer', () => {
  describe(SET_CONFIG, () => {
    it('sets the state', () => {
      const myMacroRunFn = 'test_run_fn'

      const config = MockConfig({
        macros: {
          myPlugin: '*',
        },
      })
      const plugins = Map({
        myPlugin: {
          macros: {
            myMacro: myMacroRunFn,
          },
        },
      })

      const action = setConfig({ config, plugins })

      const nextState = reducer(initialState, action)

      expect(nextState.toJS()).toEqual({
        myMacro: myMacroRunFn,
      })
    })
  })
  // describe(SPOOL_MACRO, () => {
  //   it('creates a SPOOL_TASK with the macro output', () => {
  //     const state = MockConfig()
  //     const action = spoolMacro({
  //     })
  //
  //     const [
  //       nextState,
  //       { actionToDispatch: nextAction },
  //     ] = reducer(state, action)
  //
  //     expect(nextState).toEqual(state)
  //     expect(nextAction).toEqual(
  //       spoolTask({
  //
  //       }),
  //     )
  //   })
  // })
})
