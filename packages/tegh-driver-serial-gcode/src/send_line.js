import { put, takeEvery, takeLatest, select, all } from 'redux-saga/effects'

const checksum = (line) => {
  let sum = 0
  for (char of line) {
    sum ^= char.charCodeAt(0)
  }
  sum &= 0xff
  return sum
}

export default const sendLine = function*(lineNumber, line) {
  const lineWithLineNumber = `N${lineNumber} ${line}`
  yield puts({
    type: 'SERIAL_SEND',
    data: `${lineWithLineNumber}*${checksum(lineWithLineNumber)}`,
  })
}
