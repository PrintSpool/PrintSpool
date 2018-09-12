import Peer from 'simple-peer'

import { signalTrigger }, eventTrigger from './shared/eventTrigger'
import connectToSignallingServer from './shared/connectToSignallingServer'
import * as announcement from './shared/announcement'

const connectClient = async ({ keys, peerPublicKey }) => {
  const socket = await connectToSignallingServer({ keys })

  // create an offer signal
  const rtcPeer = new Peer({ initiator: true })
  const offer = await signalTrigger(rtcPeer, 'offer')

  // announce the offer
  announcement.publish({
    socket,
    signal: offer,
    keys,
    peerPublicKey,
  })

  // await an answer
  const answerPayload = await eventTrigger(socket, 'announcement', {
    map: message => decryptPayload({ message, keys })
    filter: payload => payload.publicKey === peerPublicKey
  })

  // establish the webRTC connection
  rtcPeer.signal(answerPayload.signal)
  await eventTrigger(rtcPeer, 'connect')

  rtcPeer.on('data', (data) => {
    // got a data channel message
    console.log('got a message from client: ' + data)
  })
}
