import Peer from 'simple-peer'
import {
  RTCPeerConnection,
  RTCMediaStream,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStreamTrack,
  getUserMedia,
} from 'react-native-webrtc'

const wrtc = {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
}

import uuidv1 from 'uuid/v1'
import bloomFilter from 'bloomfilter'

import Promise from 'bluebird'
import crypto from 'react-native-crypto'
import NodeRSA from 'node-rsa'

// import ipfs from 'ipfs'
const  ipfs = null

const hostPrivateKey = new NodeRSA({b: 2048})
const hostPublicKey = hostPrivateKey.generateKeyPair()

let sharedSecret = null

const verifyProof = (clientPublicKey, proof) => {

}


export const qrCodeJSON = () => ({
  hostPublicKey: hostPublicKey.export('pkcs8'),
  sharedSecret,
})

const simplePeerHost = async ({ initiator }) => {
  console.log('simple peer?', { initiator })

  sharedSecret = await Promise.promisify(crypto.randomBytes(128))

  const text = 'Hello RSA!';
  const encrypted = key.encrypt(text, 'base64');
  console.log('encrypted: ', encrypted);
  const decrypted = key.decrypt(encrypted, 'utf8');
  console.log('decrypted: ', decrypted);


  const p = new Peer({
    initiator: true,
    trickle: false,
    wrtc,
  })

  p.on('error', function (err) { console.log('error', err) })

  const receiveBloom = new BloomFilter(
    32 * 256, // number of bits to allocate.
    16        // number of hash functions.
  )

  let clientPublicKey

  // /*
  //  * upon receiving a new signal from ipfs verify the encryption and proof of
  //  * knowledge and if those are both good then generate an answer.
  //  */
  // ifps.pubsub.subscribe(hostPublicKey, (encryptedPayload) => {
  //   // ignore duplicate payloads
  //   if (receiveBloom.test(encryptedPayload)) return null
  //   receiveBloom.add(encryptedPayload)
  //
  //   const { payload, success } = hostPrivateKey.decrypt(encryptedPayload)
  //   if (!success) return null
  //
  //   if (payload.sharedSecret !== sharedSecret) return null
  //
  //   clientPublicKey = payload.clientPublicKey
  //
  //   p.signal(payload.signal)
  // })

  p.on('signal', async (signal) => {
    console.log('SIGNAL', JSON.stringify(signal))
    // WebRTC has created a signal descriptor. Encrypt and publish it to ifps
    const encryptedSignal = new NodeRSA(clientPublicKey).encrypt({
      id: uuidv1(),
      signal,
    })
    await ifps.pubsub.publish(clientPublicKey, encryptedSignal)
  })

  p.on('connect', function () {
    console.log('CONNECT')
    p.send('whatever' + Math.random())
  })

  p.on('data', function (data) {
    console.log('data: ' + data)
  })

  p.on('error', (err) => { console.err('ERROR', err) })

  return p
}

export default simplePeerHost
