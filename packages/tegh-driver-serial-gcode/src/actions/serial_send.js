import { put, takeEvery, takeLatest, select, all } from 'redux-saga/effects'

const checksum = (line) => {
  let sum = 0
  for (const char of line) {
    sum ^= char.charCodeAt(0)
  }
  sum &= 0xff
  return sum
}

const serialSend = (lineNumber, line) => {
  const lineWithLineNumber = `N${lineNumber} ${line} `
  return {
    type: 'SERIAL_SEND',
    data: `${lineWithLineNumber}*${checksum(lineWithLineNumber)}`,
  }
}

export default serialSend
