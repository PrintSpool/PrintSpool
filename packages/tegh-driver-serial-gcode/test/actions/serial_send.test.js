// @flow
import serialSend from '../../src/actions/serial_send'

test('adds checksum and line number', () => {
  const line = '(╯°□°）╯︵ ┻━┻'
  const lineNumber = 1995
  // See http://reprap.org/wiki/G-code#.2A:_Checksum
  const expectedOutputLine = 'N1995 (╯°□°）╯︵ ┻━┻ *222'

  const result = serialSend(lineNumber, line)

  expect(result).toEqual({
    type: "SERIAL_SEND",
    data: expectedOutputLine,
  })
})
