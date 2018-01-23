// @flow
import serialSend from '../../src/actions/serial_send'

test('adds checksum and line number', () => {
  const line = '(╯°□°）╯︵ ┻━┻'
  const lineNumber = 1995
  // See http://reprap.org/wiki/G-code#.2A:_Checksum
  const expectedOutputLine = 'N1995 (╯°□°）╯︵ ┻━┻*254\n'

  const result = serialSend(line, { lineNumber })

  expect(result).toEqual({
    type: "SERIAL_SEND",
    data: expectedOutputLine,
  })
})
