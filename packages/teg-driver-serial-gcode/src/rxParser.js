// @flow
const GREETINGS = /^\u0000?(start|grbl |marlin)/
/*
 * Serial data corruption might result in ok, okok, kok or ook being sent. All
 * of these should be treated as 'ok'.
 */
const OK = /^o?k?ok/

type Feedback = {
  setsActualTemperatures?: boolean,
  /* JSON Patches may include:
   * - Estimated time in millis until the heaters reach their target
   *   temperatures (/components/:address/heater/targetTemperaturesCountdown)
   * - any temperature values received with the ack
   *   (/components/:address/heater/actualTemperature)
   * - any position values received with the ack
   *   (/components/:address/axis/actualPosition)
   */
  patch?: mixed,
}

type RxDataWithoutRaw =
  | {
    type: 'greeting' | 'debug' | 'echo' | 'parser_error',
  }
  | {
    type: 'error' | 'warning',
    message: string,
  }
  | {
    type: 'resend',
    lineNumber: number,
  }
  | Feedback & {
    type: 'ok',
  }
  | Feedback & {
    type: 'feedback',
  }

type RxData = RxDataWithoutRaw & { raw: string }


const createPatchOp = (k, v) => {
  switch (k) {
    // case w: {
    //   return {
    //     op: 'replace',
    //     path: `/targetTemperaturesCountdown`,
    //     value: v * 1000,
    //   }
    // }
    case x:
    case y:
    case z: {
      obj.components[k] = { actualPosition: v }
      return {
        op: 'replace',
        path: `/components/${k}/axis/actualPosition`,
        value: v,
      }
    }
    default: {
      // temperature values
      return {
        op: 'replace',
        path: `/components/${k}/heater/actualTemperature`,
        value: v,
      }
    }
  }
}

const parsePrinterFeedback = (line: string): Feedback => {
  if (line.match('t:') == null && line.match('x:') == null) return {}
  // Filtering out non-temperature values
  const filteredLine = line
    .replace(OK, '')
    .replace(/(\/|[a-z]*@:|e:)[0-9.]*| count .+/g, '')
    .trim()
  // Normalizing the temperature values and splitting them into words
  const keyValueWords = filteredLine
    .replace('t:', 'e0:')
    .replace(/:[\s\t]*/g, ':')
    .split(' ')
  // Construct an object containing sanitized feedback values
  const patch = []
  let setsActualTemperatures = false

  keyValueWords.forEach((word) => {
    const [key, rawValue] = word.split(':')
    const value = parseFloat(rawValue)
    if (!Number.isNaN(value) && key !== 'w') {
      patch.push(createPatchOp(feedbackObj, key, value))
      if (['x', 'y', 'z'].includes(key) === false) {
        setsActualTemperatures = true
      }
    }
  })

  return {
    patch,
    setsActualTemperatures,
  }
}

const rxParser = (raw: string): RxData => {
  const line = raw.toLowerCase()
  if (line.match(GREETINGS) != null) {
    return {
      type: 'greeting',
      raw,
    }
  }
  if (
    line.startsWith('debug_')
    || line.startsWith('compiled:')
  ) {
    return {
      type: 'debug',
      raw,
    }
  }
  if (line.startsWith('echo:')) {
    return {
      type: 'echo',
      raw,
    }
  }
  if (line.startsWith('error')) {
    const isWarning = line.startsWith('error:checksum mismatch')
    const message = raw.replace(/^error:?/i, '')
    return {
      type: isWarning ? 'warning' : 'error',
      raw,
      message,
    }
  }
  if (line.startsWith('resend') || line.startsWith('rs')) {
    const lineNumber = parseInt(line.split(/ n:| n|:/)[1], 10)
    if (typeof lineNumber !== 'number') {
      return {
        type: 'parser_error',
        raw,
      }
    }
    return {
      type: 'resend',
      lineNumber,
      raw,
    }
  }
  if (line.match(OK) != null) {
    return {
      type: 'ok',
      feedback: parsePrinterFeedback(line),
      raw,
    }
  }
  if (
    line.startsWith(' ')
    || line.startsWith('t:')
    || line.startsWith('x:')
  ) {
    return {
      type: 'feedback',
      feedback: parsePrinterFeedback(line),
      raw,
    }
  }

  return {
    type: 'parser_error',
    raw,
  }
}

export default rxParser
