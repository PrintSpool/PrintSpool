// @flow
const commentRegex = /;[^\n]*|\([^\n]*\)/g

const forEachNewLine = (input, cb) => {
  input.forEach(text => text.split('\n').forEach(cb))
}

/*
 * Split new lines and delete comments
 */
const normalizeGCodeLines = (input: [string]) => {
  const lines = []
  forEachNewLine(input, (line) => {
    if (line.matches(commentRegex) !== null) return
    lines.push(line)
  })
  return lines
}

export default normalizeGCodeLines
