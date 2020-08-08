const NEWLINE = /\r\n|\r|\n/g
const COMMENT = /;.*|\([^\\]*\)/g
const GCODE_OR_MCODE = /[GM][0-9]+/

const forEachGCode = (input, cb, alreadySplit) => {
  if (input.forEach == null) {
    throw new Error('input MUST be an array of strings')
  }
  input.forEach((entry) => {
    if (typeof entry === 'object') {
      cb(entry, true)
      return
    }

    if (typeof entry !== 'string') {
      throw new Error(`GCode line ${entry} is not a string`)
    }

    if (alreadySplit !== true) {
      forEachGCode(entry.split(NEWLINE), cb, true)
      return
    }

    if (entry[0] === '{') {
      cb(JSON.parse(entry), true)
      return
    }

    cb(entry, false)
  })
}

/*
 * Split new lines and delete comments
 */
const normalizeGCodeLines = (input, cb, initialIndex = 0) => {
  const lines = []
  let index = initialIndex

  forEachGCode(input, (line, isJSON) => {
    if (isJSON) {
      const keys = Object.keys(line)
      if (keys.length !== 1) {
        throw new Error(
          'JSON GCode objects must only contain one key. '
          + `Found: ${keys.join(',')}`,
        )
      }

      const key = keys[0]
      const upcaseKey = key.toUpperCase()
      const args = line[key]

      if (upcaseKey.match(GCODE_OR_MCODE) != null) {
        const argStrings = Object.entries(args).map(([argKey, v]) => (
          `${argKey.toUpperCase()}${v}`
        ))
        lines.push(`${upcaseKey} ${argStrings.join(' ')}`)
        index += 1
      } else {
        let injectedLines = cb(key, args, index)
        injectedLines = normalizeGCodeLines(injectedLines, cb, index)
        lines.push(...injectedLines)
        index += injectedLines.length
      }
    } else {
      if (line.startsWith('!')) {
        lines.push(line)
      } else {
        const lineWithoutComment = line.replace(COMMENT, '')
        if (lineWithoutComment.length === 0) return
        lines.push(lineWithoutComment)
      }
      index += 1
    }
  })
  return lines
}

export default normalizeGCodeLines
