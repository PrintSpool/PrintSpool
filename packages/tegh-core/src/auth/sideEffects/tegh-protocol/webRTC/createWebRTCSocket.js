import Peer from 'simple-peer'
import EventEmitter from 'eventemitter3'

import eventTrigger from './eventTrigger'
import { chunkifier, dechunkifier } from './chunk'
import sendSDP from './sendSDP'

export const SOCKET_STATES = {
  CONNECTING: 'CONNECTING',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
}

const setPeerSDP = ({ rtcPeer, peerSDP }) => {
  if (typeof peerSDP !== 'string') {
    throw new Error('invalid SDP')
  }
  rtcPeer.signal(peerSDP)
}

/*
 * creates a webRTC connection to a peer and returns:
 * {
 *   socketImpl:
 *      a constructor that can act as a drop-in replacement for a websocket
 *      implementation.
 *   rtcPeer:
 *      the simple-peer Peer object for the connection
 * }
 */
const createWebRTCSocket = async ({
  datPeer,
  sessionID,
  sessionKey,
  peerSDP,
  initiator,
  wrtc,
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

  const socket = Object.assign(new EventEmitter(), {
    sessionID,
    readyState: SOCKET_STATES.CONNECTING,
    send: (data) => {
      if (socket.readyState !== SOCKET_STATES.OPEN) {
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

  const onError = (error) => {
    socket.readyState = SOCKET_STATES.CLOSED

    if (socket.onerror == null && socket.listenerCount('error' === 0)) {
      throw new Error(error)
    }
    if (socket.onerror != null) {
      socket.onerror(error)
    }
    socket.emit('error', error)
  }

  // relay events through the socket
  rtcPeer.on('connect', () => {
    socket.readyState = SOCKET_STATES.OPEN
    if (socket.onopen != null) {
      socket.onopen()
    }
    socket.emit('open')
  })

  rtcPeer.on('data', receiveData)

  rtcPeer.on('iceStateChange', (state) => {
    if (state === 'disconnected') socket.close()
  })

  rtcPeer.on('close', () => {
    socket.readyState = SOCKET_STATES.CLOSED
    socket.onclose()
    if (socket.onclose != null) {
      socket.onclose()
    }
    socket.emit('close')
  })

  rtcPeer.on('error', onError)


  if (!initiator) {
    setPeerSDP({ rtcPeer, peerSDP })
  }

  /*
   * Await our SDP (WebRTC contact info) and when it's ready send it to the
   * remote peer.
   */
  const sdp = await eventTrigger(rtcPeer, 'signal')

  const finalizeSocket = async (protocol) => {
    await sendSDP({
      sdp,
      sessionID,
      sessionKey,
      datPeer,
      protocol,
    })

    return socket
  }

  /*
   * mimic the websocket API
   */
  const socketImpl = (url, protocol) => {
    finalizeSocket(protocol).catch(onError)

    return socket
  }

  Object.assign(socketImpl, SOCKET_STATES)

  return {
    // socketImpl is a websocket-compatible API
    socketImpl,
    // finalizeSocket is a promise-based equivalent to socketImpl
    finalizeSocket,
    rtcPeer,
  }
}

export default createWebRTCSocket
