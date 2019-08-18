import net from 'net'
import protobuf from 'protobuf'

import machinePatchReceived from '../actions/machinePatchReceived'
import machineAckReceived from '../actions/machineAckReceived'
import machineActionReceived from '../actions/machineActionReceived'

const connectToMachine = ({ machine }, dispatch) => {
  const socket = new net.Socket()
  socket.connect(`/var/run/teg/${machine.unitID}.socket`)
}

export default connectToMachine
