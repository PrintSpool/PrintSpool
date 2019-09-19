// @flow
const NEWLINE = /\r\n|\r|\n/g
const COMMENT = /;.*|\([^\\]*\)/g

const forEachNewLine = (input, cb) => {
  if (input.forEach == null) {
    throw new Error('input MUST be an array of strings')
  }
  input.forEach((entry) => {
    if (typeof entry === 'object') {
      const keys = Object.keys(entry)
      if (keys.length != 1) {
        throw new Error(
          'JSON GCode objects must only contain one key. '
          + `Found: ${keys.join(',')}`
        )
      }

      return cb(JSON.stringify(entry))
    }

    if (typeof entry !== 'string') {
      throw new Error(`${entry} (type: ${typeof entry}) is not a string`)
    }

    return entry.split(NEWLINE).forEach(cb)
  })
}

/*
 * Split new lines and delete comments
 */
const normalizeGCodeLines = (input: [string]) => {
  const lines = []
  forEachNewLine(input, (line) => {
    const lineWithoutComment = line.replace(COMMENT, '')
    if (lineWithoutComment.length === 0) return
    lines.push(lineWithoutComment)
  })
  return lines
}

export default normalizeGCodeLines
