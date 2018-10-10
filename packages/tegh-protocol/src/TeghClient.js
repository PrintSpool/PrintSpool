import Promise from 'bluebird'
import Peer from 'simple-peer'

import eventTrigger, { signalTrigger } from './shared/eventTrigger'
import connectToSignallingServer from './shared/connectToSignallingServer'
import * as announcement from './shared/announcement'

const CONNECTING = 'CONNECTING'
const OPEN = 'OPEN'
const CLOSED = 'CLOSED'

const TeghClient = ({ keys, peerPublicKey, onWebRTCConnect = () => {} }) => {
  const TeghClientSocket = (signallingServer, protocol) => {
    const rtcPeer = new Peer({ initiator: true })
    const teghSocket = {
      readyState: CONNECTING,
      send: message => rtcPeer.send(message),
      close: () => rtcPeer.destroy(),
    }

    const connect = async () => {
      const announcementSocket = await connectToSignallingServer({
        keys,
        signallingServer,
      })

      // create an offer signal
      const offer = await signalTrigger(rtcPeer, 'offer')

      // announce the offer
      await announcement.publish({
        socket: announcementSocket,
        signal: offer,
        protocol,
        keys,
        peerPublicKey,
      })

      // await an answer
      const answerPayload = await eventTrigger(
        announcementSocket,
        'announcement',
        {
          map: message => announcement.decrypt({ message, keys }),
          filter: payload => payload.publicKey === peerPublicKey,
        },
      )

      // establish the webRTC connection
      rtcPeer.signal(answerPayload.signal)

      // relay events through the teghSocket
      rtcPeer.on('connect', () => {
        teghSocket.readyState = OPEN
        onWebRTCConnect(rtcPeer)
        teghSocket.onopen()
      })

      rtcPeer.on('data', (data) => {
        teghSocket.onmessage({ data })
      })

      rtcPeer.on('close', () => {
        teghSocket.readyState = CLOSED
        teghSocket.onclose()
      })

      rtcPeer.on('error', () => {
        teghSocket.onerror()
      })
    }

    connect()
    return teghSocket
  }

  TeghClientSocket.CONNECTING = CONNECTING
  TeghClientSocket.OPEN = OPEN
  TeghClientSocket.CLOSED = CLOSED

  return TeghClientSocket
}

export default TeghClient
