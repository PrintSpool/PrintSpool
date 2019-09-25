import path from 'path'
import * as net from 'net'
import { Buffer } from 'buffer'

import protobuf from 'protobufjs'
import chokidar from 'chokidar'

import socketMessage from '../actions/socketMessage'

const SIZE_DELIMETER_BYTES = 4

// TODO: productionn protos directory
// const protosDir = path.join(__dirname, 'protos')
const protosDir = path.join(__dirname, '../../../',  'protos')

export const createSocketManager =  ({ machineID, socketPath }) => ({
  machineID,
  socketPath,
  connected: false,
  socket: null,
  close: () => {},
})

export const startSocketManager = async (manager, dispatch) => {
  const machineRoot = await protobuf.load(path.join(protosDir, 'MachineMessage.proto'))
  const combinatorRoot = await protobuf.load(path.join(protosDir, 'CombinatorMessage.proto'))

  const MachineMessage = machineRoot.lookupType('teg_protobufs.MachineMessage')

  const onDisconnect = (dispatch) => {
    // console.log("disconnect")
    manager.socket = null
    // immediately try reconnecting on disconnect in case a new socket is already available
    if (manager.connected) connect()
  }

  const connect = () => {
    // console.log("attempt connection")
    manager.connected = false
    manager.socket = net.connect(manager.socketPath)

    let buffer = Buffer.from([])
    manager.socket.on('connect', () => {
      // console.log('connect')
      // if the socket is closed before we try to connect an error event will be emitted instead
      // and this code will not be reached
      manager.connected = true
    })

    manager.socket.on('error', () => {})
    manager.socket.on('close', onDisconnect)

    manager.socket.on('data', (data) => {
      buffer = Buffer.concat([buffer, data])

      const size = buffer.readInt32LE()
      // console.log(size, buffer.length)

      if (buffer.length >= size) {
        const message = MachineMessage.decode(buffer.slice(SIZE_DELIMETER_BYTES, SIZE_DELIMETER_BYTES + size))
        buffer = buffer.slice(SIZE_DELIMETER_BYTES + size)
        // console.log(message.feedback.heaters)

        const event = socketMessage(manager.machineID, message)
        dispatch(event)
      }
    })
  }

  const watcher = chokidar.watch(path.join(manager.socketPath, '..'), {
    persistent: true,
    depth: 0,
  })

  const onSocketFdChange = (filePath) => {
    if (filePath === manager.socketPath) {
      // console.log('add')
      connect()
    }
  }

  watcher.on('add', onSocketFdChange)
  watcher.on('change', onSocketFdChange)

  manager.close = () => {
    watcher.close()
    if (manager.socket != null) {
      manager.socke.close()
    }
  }
}
