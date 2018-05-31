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
  serialPort.write = (line) => {
    const code = line.split(/ +/)[1].toLowerCase().replace(/\*.*|\n/g, '')
    if (responses[code] == null) {
      sendLines(responses['g1'])
    } else {
      sendLines(responses[code])
    }
  }
  return {
    serialPort,
    parser,
    isConnected: () => true,
  }
}

export default simulator
