import { List, Map } from 'immutable'

import createMacroExpansionReducer, { initialState } from './createMacroExpansionReducer'

import { MockConfig } from '../../config/types/Config'
import { MockTask } from '../../spool/types/Task'

import setConfig, { SET_CONFIG } from '../../config/actions/setConfig'
import despoolTask, { DESPOOL_TASK } from '../../spool/actions/despoolTask'
import despoolCompleted from '../../spool/actions/despoolCompleted'

const meta = {
  package: '@tegapp/example-package',
  macro: 'doExample',
}
const macroFn = (args, { config }) => [
  config.printer.id,
  JSON.stringify(args),
]

const reducer = createMacroExpansionReducer(meta, macroFn)

const enabledConfig = MockConfig()
  .setIn(['printer', 'plugins', 0, 'package'], '@tegapp/example-package')
  .setIn(['printer', 'plugins', 0, 'model', 'macros'], List(['*']))
const plugins = Map({
  '@tegapp/example-package': {
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
  describe(DESPOOL_TASK, () => {
    it('ignores other macros', () => {
      const action = despoolTask(MockTask({
        currentLineNumber: 0,
        data: ['otherMacro X10'],
      }), List())

      const config = MockConfig()

      const state = initialState
        .set('enabled', true)
        .set('config', config)

      const nextState = reducer(state, action)

      expect(nextState).toEqual(state)
    })
    it('spools the gcode expansion and despools the next line', () => {
      const task = MockTask({
        currentLineNumber: 0,
        data: ['doExample X10'],
      })
      const action = despoolTask(task, List())

      const config = MockConfig()

      const state = initialState
        .set('enabled', true)
        .set('config', config)

      const [, sideEffects] = reducer(state, action)

      const nextActions = sideEffects.cmds.map(sideEffect => (
        sideEffect.actionToDispatch
      ))
      expect(nextActions).toHaveLength(2)
      expect(nextActions[0].payload.task.data).toEqual(List([
        config.printer.id,
        '{"x":10}',
      ]))
      expect(nextActions[1]).toEqual(despoolCompleted({ task }))
    })
  })
})
