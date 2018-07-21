import events from 'events'
import { greeting, responses } from '../../data/marlinFixture'

const simulator = () => {
  const serialPort = new events.EventEmitter()
  const parser = new events.EventEmitter()
  const sendLines = lines => lines.forEach(line => {
    setImmediate(() => {
      parser.emit('data', line)
    })
  })

  serialPort.open = () => {
    setImmediate(() => serialPort.emit('open'))
    sendLines(greeting)
  }
  serialPort.close = (cb) => {
    serialPort.emit('close')
    cb()
  }
  serialPort.write = (line, cb = () => {}) => {
    const words = line.split(/ +/)
    const code = (() => {
      if (words[1] == null) return null
      return words[1].toLowerCase().replace(/\*.*|\n/g, '')
    })()
    if (responses[code] == null) {
      sendLines(responses['g1'])
    } else {
      sendLines(responses[code])
    }
    cb()
  }
  return {
    serialPort,
    parser,
    isConnected: () => true,
  }
}

export default simulator
