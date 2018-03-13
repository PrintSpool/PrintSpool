// @flow
const NEWLINE = /\r\n|\r|\n/g
const COMMENT = /;.*|\([^\\]*\)/g

const forEachNewLine = (input, cb) => {
  if (input.forEach == null) {
    throw new Error('input MUST be an array of strings')
  }
  input.forEach(text => {
    if (text.split == null) {
      throw new Error(`${text} (type: ${typeof text}) is not a string`)
    }
    return text.split(NEWLINE).forEach(cb)
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
