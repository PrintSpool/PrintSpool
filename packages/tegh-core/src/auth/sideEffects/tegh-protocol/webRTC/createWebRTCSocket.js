import Peer from 'simple-peer'

import eventTrigger from './eventTrigger'
import { chunkifier, dechunkifier } from './chunk'
import sendSDP from './sendSDP'

const CONNECTING = 'CONNECTING'
const OPEN = 'OPEN'
const CLOSED = 'CLOSED'

const WebRTCSocket = function () {}

WebRTCSocket.CONNECTING = CONNECTING
WebRTCSocket.OPEN = OPEN
WebRTCSocket.CLOSED = CLOSED

const setPeerSDP = ({ rtcPeer, peerSDP }) => {
  if (typeof peerSDP !== 'string') {
    throw new Error('invalid SDP')
  }
  rtcPeer.signal(peerSDP)
}

/*
 * creates a webRTC connection to a peer and returns:
 * {
 *   socket: an object that can act as a drop-in replacement for a websocket
 *           connection
 *   rtcPeer: the simple-peer Peer object for the connection
 * }
 */
const createWebRTCSocket = async ({
  datPeer,
  sessionID,
  sessionKey,
  peerSDP,
  initiator,
  wrtc,
  protocol,
}) => {
  const rtcPeer = new Peer({
    initiator,
    wrtc,
  })

  // eslint-disable-next-line no-underscore-dangle
  const sendInChunks = chunkifier(rtcPeer._channel, (data) => {
    // console.log('tx', data)
    rtcPeer.send(data)
  })

  const socket = Object.assign(new WebRTCSocket(), {
    readyState: CONNECTING,
    send: (data) => {
      if (socket.readyState !== OPEN) {
        throw new Error('Cannot call send on a closed connection')
      }
      sendInChunks(data)
    },
    close: () => {
      console.log('close webrtc')
      rtcPeer.destroy()
    },
  })

  const receiveData = dechunkifier((data) => {
    // console.log('rx', data)
    socket.onmessage({ data })
  })

  // relay events through the socket
  rtcPeer.on('connect', () => {
    socket.readyState = OPEN
    socket.onopen()
  })

  rtcPeer.on('data', receiveData)

  rtcPeer.on('iceStateChange', (state) => {
    if (state === 'disconnected') socket.close()
  })

  rtcPeer.on('close', () => {
    socket.readyState = CLOSED
    socket.onclose()
  })

  rtcPeer.on('error', () => {
    socket.onerror()
  })


  if (!initiator) {
    setPeerSDP({ rtcPeer, peerSDP })
  }

  /*
   * Await our SDP (WebRTC contact info) and when it's ready send it to the
   * remote peer.
   */
  const sdp = await eventTrigger(rtcPeer, 'signal')
  await sendSDP({
    sdp,
    sessionID,
    sessionKey,
    datPeer,
    protocol,
  })

  return {
    socket,
    rtcPeer,
  }
}

export default createWebRTCSocket
