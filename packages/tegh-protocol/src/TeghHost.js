import Peer from 'simple-peer'

import { signalTrigger }, eventTrigger from './shared/eventTrigger'
import connectToSignallingServer from './shared/connectToSignallingServer'
import * as announcement from './shared/announcement'

/*
 * keys = { private, public } - PEM format private and public keys
 * authenticate = (clientPulbicKey) => <any> - function that takes a client's
 * public key and returns an account object or `false` if they are unauthorized.
 */
const TeghHost = async ({ keys, authenticate }) => {
  const socket = await connectToSignallingServer({ keys })

  socket.on('announcement', async (message) => {
    // validate and decrypt the client's announcement
    const offerPayload = await decryptPayload({ message, keys })

    // authenticate the client via their public key
    const account = authenticate(offerPayload.publicKey)
    if (account == false) return

    // accept the offer from the client
    const rtcPeer = new Peer({ initiator: false })
    rtcPeer.signal(offerPayload.signal)

    // create and send an answer
    const answerSignal = await signalTrigger(rtcPeer, 'answer')
    announcement.publish({
      socket,
      signal: answerSignal,
      keys,
      peerPublicKey: payload.publicKey,
    })

    // wait for the client to establish the webRTC connection
    await eventTrigger(rtcPeer, 'connect')

    console.log('HOST RTC CONNECTED')

    rtcPeer.on('data', (data) => {
      // got a data channel message
      console.log('got a message from client: ' + data)
    })
  })
}
