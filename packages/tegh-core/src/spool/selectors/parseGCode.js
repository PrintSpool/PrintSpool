const parseGCode = (line) => {
  if (line[0] === '{') {
    /*
     * JSON GCode format
     * eg: `{ "g1": {"x": 10, "y": 30} }`
     */
    const jsonGCode = JSON.parse(line)
    const macro = Object.keys(jsonGCode)[0]
    const args = jsonGCode[macro]

    return { macro, args }
  }

  /*
   * Traditional GCode format
   * eg: "G1 X10 Y30"
   */
  const trimmedLine = line.trim()
  const firstSpace = trimmedLine.indexOf(' ')
  const hasArgs = firstSpace !== -1

  if (hasArgs) {
    const macro = trimmedLine.slice(0, firstSpace)

    const argsString = trimmedLine.slice(firstSpace + 1).trim()

    const argWords = argsString.split(/ +/)
    const args = {}
    argWords.forEach((word) => {
      args[word[0].toLowerCase()] = parseFloat(word.slice(1))
    })

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

export default parseGCode
