import Promise from 'bluebird'
import Peer from 'simple-peer'
import EventEmitter from 'eventemitter3'

import eventTrigger, { signalTrigger } from './shared/eventTrigger'
import connectToSignallingServer from './shared/connectToSignallingServer'
import * as announcement from './shared/announcement'

/*
 * keys = { private, public } - PEM format private and public keys
 * authenticate = (clientPulbicKey) => <any> - function that takes a client's
 * signallingServer = string - the url to the central signallingServer
 * public key and returns an account object or `false` if they are unauthorized.
 */
const TeghHost = ({ keys, authenticate, signallingServer }) => {
  const teghHost = new EventEmitter()

  const connect = async () => {
    const announcementSocket = await connectToSignallingServer({
      keys,
      signallingServer,
    })
    console.log('CONNECTED TO SIGNALLING SERVER')

    announcementSocket.on('announcement', async (message) => {
      console.log('received announcement!!!')
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
        socket: announcementSocket,
        signal: answerSignal,
        keys,
        peerPublicKey: payload.publicKey,
      })

      // wait for the client to establish the webRTC connection and
      // create a public interface that can act as a drop-in replacement for a
      // websocket connection
      const teghSocket = new EventEmitter()
      teghSocket.protocol = answerSignal.protocol

      // relay events through the teghSocket
      rtcPeer.on('connect', () => {
        teghHost.emit('connection', teghSocket)
      })

      rtcPeer.on('data', (data) => {
        teghHost.emit('message', data)
      })

      rtcPeer.on('close', () => {
        teghSocket.on('close')
      })

      rtcPeer.on('error', () => {
        teghSocket.on('error')
      })
    })
  }

  connect()
  return teghHost
}

export default TeghHost
