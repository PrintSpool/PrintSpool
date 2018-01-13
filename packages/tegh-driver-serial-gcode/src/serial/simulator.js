import events from 'events'
import { greeting, responses } from '../../data/marlin_fixture'
import { simpleParser } from '../tx_parser'

const simulator = () => {
  const serialPort = new events.EventEmitter()
  const parser = new events.EventEmitter()
  const sendLines = lines => lines.forEach(line => {
    setImmediate(() => {
      // console.log(`sim RX: ${line}`)
      parser.emit('data', line)
    })
  })

  serialPort.open = () => {
    setImmediate(() => serialPort.emit('open'))
    sendLines(greeting)
  }
  serialPort.write = (line) => {
    // console.log(`sim TX: ${line.replace('\n', '')}`)
    const code = simpleParser(line).code.toLowerCase()
    if (responses[code] == null) {
      sendLines(responses['g1'])
    } else {
      sendLines(responses[code])
    }
  }
  return {
    serialPort,
    parser,
  }
}

export default simulator
