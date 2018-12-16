// @flow
import serialSend, { SERIAL_SEND } from './serialSend'

const macro = 'G12345'
const args = { writeAParserTheySaidItWillBeFunTheySaid: '(╯°□°）╯︵ ┻━┻' }
const line = 'G12345 WRITEAPARSERTHEYSAIDITWILLBEFUNTHEYSAID(╯°□°）╯︵ ┻━┻'

describe('with a line number', () => {
  test('adds the checksum and line number', () => {
    const lineNumber = 1995
    // See http://reprap.org/wiki/G-code#.2A:_Checksum
    const expectedOutputLine = `N1995 ${line}*234\n`

    const result = serialSend({ macro, args, lineNumber })

    expect(result).toEqual({
      type: SERIAL_SEND,
      payload: {
        macro,
        args,
        lineNumber,
        line: expectedOutputLine,
      },
    })
  })
})

describe('with lineNumber: false', () => {
  test('sends the line without a line number', () => {
    const expectedOutputLine = `${line}*128\n`

    const result = serialSend({ macro, args, lineNumber: false })

    expect(result).toEqual({
      type: SERIAL_SEND,
      payload: {
        macro,
        args,
        lineNumber: false,
        line: expectedOutputLine,
      },
    })
  })
})

describe('with lineNumber: undefined', () => {
  test('throws an error', () => {
    expect(() => {
      serialSend({ macro, args, lineNumber: undefined })
    }).toThrow()
  })
})
