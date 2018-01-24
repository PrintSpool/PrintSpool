// @flow
import serialSend from './serialSend'

test('adds checksum and line number', () => {
  const line = 'G12345 (╯°□°）╯︵ ┻━┻'
  const lineNumber = 1995
  // See http://reprap.org/wiki/G-code#.2A:_Checksum
  const expectedOutputLine = `N1995 ${line}*168\n`

  const result = serialSend(line, { lineNumber })

  expect(result).toEqual({
    type: 'SERIAL_SEND',
    code: 'G12345',
    lineNumber,
    data: expectedOutputLine,
  })
})
