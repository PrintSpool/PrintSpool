// @flow
const GREETINGS = /^\u0000?(start|grbl |marlin)/
/*
 * Serial data corruption might result in ok, okok, kok or ook being sent. All
 * of these should be treated as 'ok'.
 */
const OK = /^o?k?ok/

type Feedback = {
  /* any temperature values received with the ack */
  temperatures?: mixed,
  /* Estimated time in millis until the heaters reach their target
   * temperatures */
  targetTemperaturesCountdown?: ?number,
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
  // Construct an object containing current temperature values
  const feedbackVals = {}
  keyValueWords.forEach((word) => {
    const [key, rawValue] = word.split(':')
    const value = parseFloat(rawValue)
    if (!Number.isNaN(value)) feedbackVals[key] = value
  })
  const { w, x, y, z, ...temperatures } = feedbackVals

  const meta = {
    temperatures,
    // Parsing "w" temperature countdown values
    // see: http://git.io/FEACGw or google "TEMP_RESIDENCY_TIME"
    targetTemperaturesCountdown: w == null ? null : w * 1000,
    position: x == null ? null : { x, y, z },
  }

  return meta
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
      ...parsePrinterFeedback(line),
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
      ...parsePrinterFeedback(line),
      raw,
    }
  }

  return {
    type: 'parser_error',
    raw,
  }
}

export default rxParser
