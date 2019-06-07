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
      temperatures.e0 += targets.e0 > temperatures.e0 ? 5 : -2
    }
    if (targets.b !== temperatures.b) {
      temperatures.b += targets.b > temperatures.b ? 3 : -2
    }
  }

  setInterval(updateTemperatures, 100)

  const sendLines = (lines, lowerCaseMacro) => (
    lines({
      extruder: temperatures.e0 - 2 + Math.random() * 4,
      bed: temperatures.b - 2 + Math.random() * 4,
    }).forEach((line) => {
      setTimeout(() => {
        parser.emit('data', line)
      }, lowerCaseMacro === 'm400' ? 3000 : 10)
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

    const lowerCaseMacro = macro.toLowerCase()

    if (responses[lowerCaseMacro] == null) {
      sendLines(responses.g1)
    } else if (lowerCaseMacro === 'm109') {
      // console.log('TX!!!', macro)
      const sendNextLine = () => {
        // console.log('send response')
        if (temperatures[id] >= targets[id] - 3) {
          return sendLines(responses.m105, lowerCaseMacro)
        }

        sendLines(responses.m109, lowerCaseMacro)
        setTimeout(sendNextLine, 3000 / 50)
      }

      sendNextLine()
    } else {
      sendLines(responses[lowerCaseMacro], lowerCaseMacro)
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
