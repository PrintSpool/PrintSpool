const GREETINGS = /^(start|grbl |ok|.*t:)/

// type RxParserParsedData = {
//   isDebug?: Boolean,
//   isGreeting?: Boolean,
//   isEcho?: Boolean,
//   isAck?: Boolean,
//   isResend?: Boolean,
//   isError?: Boolean,
//   /* the line number to resend if isResend is true */
//   lineNumber?: Int,
//   /* any temperature values received with the ack */
//   temperatures?: {}
//   /* Estimated time in millis until the heaters reach their target
//    * temperatures */
//   targetTemperaturesCountdown?: Float
// }

const parsePrinterFeedback = (line) => {
  if (!line.has("t:")) return {}
  // Filtering out non-temperature values
  const filteredLine = line.remove(/(\/|[a-z]*@:|e:)[0-9\.]*|ok/g)
  // Normalizing the temperature values and splitting them into words
  const keyValueWords  = filteredLine
    .replace("t:", "e0:")
    .replace(/:[\s\t]*/g, ':')
    .words()
  // Construct an object containing current temperature values
  const feedback = {}
  keyValueWords.forEach((word) => {
    const [key, rawValue] = word.split(':')
    const value = parseFloat(rawValue)
    if (!isNaN(value)) feedback[key] = value
  })
  // Parsing "w" temperature countdown values
  // see: http://git.io/FEACGw or google "TEMP_RESIDENCY_TIME"
  const {w} = feedback
  delete feedback.w
  const targetTemperaturesCountdown = (w ? w * 1000 : null)
  return {
    temperatures: feedback,
    targetTemperaturesCountdown,
  }
}

const rxParser = (originalLine, {ready}) => {
  const line = originalLine.toLowerCase()
  if (!ready && line.has(GREETINGS)) return {
    isGreeting: true,
  }
  if (line.startsWith("debug_")) return {
    isDebug: true,
  }
  if (line.startsWith('echo:')) return {
    isEcho: true,
  }
  if (line.startsWith('error')) return {
    isError: true,
  }
  if (line.startsWith('resend') || line.startsWith('rs')) {
    const lineNumber = parseInt(line.split(/N:|N|:/)[1])
    return {
      isResend: true,
      lineNumber,
    }
  }

  return {
    isAck: line.startsWith('ok'),
    ...parsePrinterFeedback(line),
  }
}

export default rxParser
