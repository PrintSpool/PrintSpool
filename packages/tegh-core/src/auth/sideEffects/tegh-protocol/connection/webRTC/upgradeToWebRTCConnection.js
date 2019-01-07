import Peer from 'simple-peer'
import EventEmitter from 'eventemitter3'

import eventTrigger from '../eventTrigger'
import { chunkifier, dechunkifier } from './chunk'
import sendSDP from './sendSDP'

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
const upgradeToWebRTCSocket = async ({
  currentConnection,
  peerSDP,
  wrtc,
  protocol,
}) => {
  const { initiator } = currentConnection

  const rtcPeer = new Peer({
    initiator,
    wrtc,
  })

  // eslint-disable-next-line no-underscore-dangle
  const sendInChunks = chunkifier(rtcPeer._channel, (data) => {
    // console.log('tx', data)
    rtcPeer.send(data)
  })

  const dataReceiver = new EventEmitter()

  rtcPeer.on('data', dechunkifier((data) => {
    // console.log('rx', data)
    dataReceiver.on('data', data)
  }))

  rtcPeer.on('iceStateChange', (state) => {
    if (state === 'disconnected') rtcPeer.close()
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
    currentConnection,
    protocol,
    sdp,
  })

  if (initiator) {
    // wait until a SDP is sent back
    const response = await eventTrigger(currentConnection, 'data', {
      filter: data => (
        data.connection === 'upgrade'
        && data.sdp != null
      ),
    })

    setPeerSDP({ rtcPeer, peerSDP: response.dsp })
  }

  await eventTrigger(rtcPeer, 'connect')

  const nextConnection = {
    send: async (data) => {
      sendInChunks(data)
    },
    close: () => rtcPeer.destroy(),
    // events: data, error
    on: (eventName, callback) => {
      if (eventName === 'data') {
        dataReceiver.on(eventName, callback)
        return
      }
      rtcPeer.on(eventName, callback)
    },
  }

  return nextConnection
}

export default upgradeToWebRTCSocket
