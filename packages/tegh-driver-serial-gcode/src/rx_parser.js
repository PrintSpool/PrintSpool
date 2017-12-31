// @flow
import stream from 'stream'

const GREETINGS = /^(start|grbl )/

type Feedback = {
  /* any temperature values received with the ack */
  temperatures?: mixed,
  /* Estimated time in millis until the heaters reach their target
   * temperatures */
  targetTemperaturesCountdown?: ?number,
}

type RxDataWithoutRaw =
  | {
    type: 'greeting' | 'debug' | 'echo' | 'error' | 'parser_error',
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
  if (line.match("t:") == null) return {}
  // Filtering out non-temperature values
  const filteredLine = line
    .replace(/^(ok | )/, '')
    .replace(/(\/|[a-z]*@:|e:)[0-9\.]*/g, '')
  // Normalizing the temperature values and splitting them into words
  const keyValueWords  = filteredLine
    .replace("t:", "e0:")
    .replace(/:[\s\t]*/g, ':')
    .split(' ')
  // Construct an object containing current temperature values
  const temperatures = {}
  keyValueWords.forEach((word) => {
    const [key, rawValue] = word.split(':')
    const value = parseFloat(rawValue)
    if (!isNaN(value)) temperatures[key] = value
  })
  // Parsing "w" temperature countdown values
  // see: http://git.io/FEACGw or google "TEMP_RESIDENCY_TIME"
  const { w } = temperatures
  delete temperatures.w
  const targetTemperaturesCountdown = (w ? w * 1000 : null)
  return {
    temperatures,
    targetTemperaturesCountdown,
  }
}

const rxParser = (raw: string): RxData => {
  const line = raw.toLowerCase()
  if (line.match(GREETINGS) != null) return {
    type: 'greeting',
    raw,
  }
  if (line.startsWith("debug_")) return {
    type: 'debug',
    raw,
  }
  if (line.startsWith('echo:')) return {
    type: 'echo',
    raw,
  }
  if (line.startsWith('error')) return {
    type: 'error',
    raw,
  }
  if (line.startsWith('resend') || line.startsWith('rs')) {
    const lineNumber = parseInt(line.split(/N:|N|:/)[1])
    return {
      type: 'resend',
      lineNumber,
      raw,
    }
  }
  if (line.startsWith('ok')) {
    return {
      type: 'ok',
      ...parsePrinterFeedback(line),
      raw,
    }
  }
  if (line.startsWith(' ')) {
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
