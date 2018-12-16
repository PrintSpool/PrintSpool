import getCurrentLine from '../selectors/getCurrentLine'

export const DESPOOL_TASK = 'tegh-core/spool/DESPOOL_TASK'

const parseGCodeArgs = (argsString) => {
  if (argsString.startsWith('{')) {
    /*
     * JSON format args.
     * eg: "G1 {x: 10, y: 30}"
     */
    return JSON.parse(argsString)
  }
  /*
   * Traditional GCode format args.
   * eg: "G1 X10 Y30"
   */
  const argWords = argsString.split(/ +/)
  const args = {}
  argWords.forEach((word) => {
    args[word[0].toLowerCase()] = parseFloat(word.slice(1))
  })
  return args
}

const parseGCode = (line) => {
  const trimmedLine = line.trim()
  const firstSpace = trimmedLine.indexOf(' ')
  const hasArgs = firstSpace !== -1

  if (hasArgs) {
    const macro = trimmedLine.slice(0, firstSpace)

    const argsString = trimmedLine.slice(firstSpace + 1).trim()
    const args = parseGCodeArgs(argsString)

    return {
      macro,
      args,
    }
  }

  // if there are no args return an empty args object instead
  return {
    macro: trimmedLine,
    args: {},
  }
}

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
