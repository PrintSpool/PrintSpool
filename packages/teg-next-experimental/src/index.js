import path from 'path'
import * as net from 'net'
import { Buffer } from 'buffer'

import protobuf from 'protobufjs'
import chokidar from 'chokidar'

const SIZE_DELIMETER_BYTES = 4

const socketPath = path.join(__dirname, '../../teg-rust-experimental/target/debug/machine.sock')

const load = async () => {
  const machineRoot = await protobuf.load(path.join(__dirname, 'protos/MachineMessage.proto'))
  const combinatorRoot = await protobuf.load(path.join(__dirname, 'protos/CombinatorMessage.proto'))

  const MachineMessage = machineRoot.lookupType('teg_protobufs.MachineMessage')

  // persistent
  let connected = false
  let socket = null

  const onDisconnect = () => {
    console.log("disconnect")
    socket = null
    // immediately try reconnecting on disconnect in case a new socket is already available
    if (connected) connect()
  }

  const connect = () => {
    console.log("connect")
    connected = false
    socket = net.connect(socketPath)

    let buffer = Buffer.from([])
    socket.on('connect', () => {
      // if the socket is closed before we try to connect an error event will be emitted instead
      // and this code will not be reached
      connected = true
    })

    socket.on('error', () => {})
    socket.on('close', onDisconnect)

    socket.on('data', (data) => {
      buffer = Buffer.concat([buffer, data])

      const size = buffer.readInt32LE()

      if (buffer.length >= size) {
        const message = MachineMessage.decode(buffer.slice(SIZE_DELIMETER_BYTES, SIZE_DELIMETER_BYTES + size))
        console.log(message.feedback.heaters)
      }
    })
  }

  const watcher = chokidar.watch(socketPath, { persistent: true })

  watcher.on('add', () => {
    console.log('add')
    connect()
  })
}

load()
