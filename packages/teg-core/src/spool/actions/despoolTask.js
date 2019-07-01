import getCurrentLine from '../selectors/getCurrentLine'
import parseGCode from '../selectors/parseGCode'

export const DESPOOL_TASK = 'teg-core/spool/DESPOOL_TASK'

const despoolTask = (task, enabledHostMacros = [], {
  createdAt = new Date().toISOString(),
} = {}) => {
  const currentLine = getCurrentLine.resultFunc(task)
  const { macro, args } = parseGCode(currentLine)

  return ({
    type: DESPOOL_TASK,
    payload: {
      createdAt,
      /*
       * true if a macro is defined in teg with the same name as the first
       * word of the gcode line. Host macros should be implemented in a
       * macro reducer and are skipped by the driver.
       */
      isHostMacro: enabledHostMacros.includes(macro),
      isLastLineInTask: task.currentLineNumber === task.data.size - 1,

      macro,
      args,

      task,
    },
  })
}

export default despoolTask
