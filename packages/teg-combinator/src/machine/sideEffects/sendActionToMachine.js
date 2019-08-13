import msgpack from 'msgpack-lite'

const sendActionToMachine = ({ machineConnection, action }) => {
  const msg = msgpack.encode(action)
  machineConnection.actionsSender.send(msg)
}

export default sendActionToMachine
