import nano from 'nanomsg'
import msgpack from 'msgpack-lite'

import machinePatchReceived from '../actions/machinePatchReceived'
import machineAckReceived from '../actions/machineAckReceived'
import machineActionReceived from '../actions/machineActionReceived'

const connectToMachine = ({ machine }, dispatch) => {
  const messageHandler = actionCreator => (unparsedMsg) => {
    const action = actionCreator({
      machineID: machine.id,
      msg: msgpack.decode(unparsedMsg),
    })
    dispatch(action)
  }

  const patchesSubscription = nano.socket('sub')
  const actionsSender = nano.socket('req')
  const actionsReceiver = nano.socket('res')

  patchesSubscription.connect(`/var/run/teg/${machine.unitID}-patches-subscription.socket`)
  actionsSender.connect(`/var/run/teg/${machine.unitID}-actions-to-machine.socket`)
  actionsReceiver.connect(`/var/run/teg/${machine.unitID}-actions-from-machine.socket`)

  patchesSubscription.on('data', messageHandler(machinePatchReceived))
  actionsSender.on('data', messageHandler(machineAckReceived))
  actionsReceiver.on('data', messageHandler(machineActionReceived))

  return {
    machineID: machine.id,
    patchesSubscription,
    actionsSender,
    actionsReceiver,
  }
}

export default connectToMachine
