import getCurrentLine from '../selectors/getCurrentLine'
import parseGCode from '../selectors/parseGCode'

export const DESPOOL_TASK = 'tegh-core/spool/DESPOOL_TASK'

const despoolTask = (task, macros) => {
  const currentLine = getCurrentLine.resultFunc(task)
  const { macro, args } = parseGCode(currentLine)

  return ({
    type: DESPOOL_TASK,
    payload: {
      /*
       * true if a macro is defined in tegh with the same name as the first
       * word of the gcode line. Host macros should be implemented in a
       * macro reducer and are skipped by the driver.
       */
      isHostMacro: macros.includes(macro),

      macro,
      args,

      task,
    },
  })
}

export default despoolTask
