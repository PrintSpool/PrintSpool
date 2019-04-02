import { Record } from 'immutable'
import { loop, Cmd } from 'redux-loop'

import { SET_CONFIG } from '../../config/actions/setConfig'
import spoolTask, { SPOOL_TASK } from '../../spool/actions/spoolTask'
import { DESPOOL_TASK } from '../../spool/actions/despoolTask'
import { NORMAL } from '../../spool/types/PriorityEnum'

import getPluginModels from '../../config/selectors/getPluginModels'

const initialState = Record({
  beforePrintHook: null,
  afterPrintHook: null,
})()

const jobQueueMacrosReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload
      const {
        beforePrintHook,
        afterPrintHook,
      } = getPluginModels(config).get('@tegh/core')

      const splitLines = hook => (hook == null ? null : hook.split('\n'))

      return state.merge({
        beforePrintHook: splitLines(beforePrintHook),
        afterPrintHook: splitLines(afterPrintHook),
      })
    }
    case SPOOL_TASK: {
      const { beforePrintHook } = state
      const { jobID } = action.payload.task

      if (jobID == null || beforePrintHook == null) {
        return state
      }

      const taskAttrs = {
        priority: NORMAL,
        internal: true,
        name: '[BEFORE_PRINT_HOOK]',
        data: beforePrintHook,
      }

      return loop(
        state,
        Cmd.action(spoolTask(taskAttrs, { prepend: true })),
      )
    }
    case DESPOOL_TASK: {
      const { afterPrintHook } = state
      const { jobID } = action.payload.task

      if (jobID == null || afterPrintHook == null) {
        return state
      }

      const taskAttrs = {
        priority: NORMAL,
        internal: true,
        name: '[AFTER_PRINT_HOOK]',
        data: afterPrintHook,
      }

      return loop(
        state,
        Cmd.action(spoolTask(taskAttrs, { prepend: true })),
      )
    }
    default: {
      return state
    }
  }
}

export default jobQueueMacrosReducer
