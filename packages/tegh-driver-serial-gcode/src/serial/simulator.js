import events from 'events'
import { greeting, responses } from '../marlinFixture'
import txParser from '../txParser'

const simulator = () => {
  const serialPort = new events.EventEmitter()
  const parser = new events.EventEmitter()

  const targets = {
    e0: 22,
    b: 22,
  }
  const temperatures = {
    e0: 22,
    b: 22,
  }

  const updateTemperatures = () => {
    if (targets.e0 !== temperatures.e0) {
      temperatures.e0 += targets.e0 > temperatures.e0 ? 10 : -2
    }
    if (targets.b !== temperatures.b) {
      temperatures.b += targets.b > temperatures.b ? 5 : -2
    }
  }

  setInterval(updateTemperatures, 100)

  const sendLines = lines => (
    lines({
      extruder: temperatures.e0 - 2 + Math.random() * 4,
      bed: temperatures.b - 2 + Math.random() * 4,
    }).forEach((line) => {
      // console.log(line)
      setImmediate(() => {
        parser.emit('data', line)
      })
    })
  )

  serialPort.isOpen = false
  serialPort.open = () => {
    serialPort.isOpen = true
    setImmediate(() => serialPort.emit('open'))
    setImmediate(() => sendLines(() => greeting))
  }
  serialPort.close = async () => {
    serialPort.isOpen = false
    serialPort.emit('close')
  }
  serialPort.write = (line, cb, { macro, args }) => {
    const { collectionKey, id, changes } = txParser({ macro, args })

    if (collectionKey === 'heaters' && changes.targetTemperature != null) {
      targets[id] = changes.targetTemperature || 22
    }

    if (responses[macro.toLowerCase()] == null) {
      sendLines(responses.g1)
    } else if (macro === 'M109') {
      // console.log('TX!!!', macro)
      let linesSent = 0

      const sendNextLine = () => {
        if (linesSent === 50) {
          return sendLines(responses.m105)
        }

        sendLines(responses.m109)
        linesSent += 1
        setTimeout(sendNextLine, 2000 / 50)
      }

      sendNextLine()
    } else {
      sendLines(responses[macro.toLowerCase()])
    }
    if (cb != null) cb()
  }
  return {
    serialPort,
    parser,
    isConnected: () => true,
  }
}

export default simulator
