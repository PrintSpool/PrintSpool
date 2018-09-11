// import { compose, withContext } from 'recompose'
// import simplePeerTest from './simplePeerTest'
import QRReader from 'react-qr-reader'

// import IPFS from 'ipfs'
// import Room from 'ipfs-pubsub-room'

const global = typeof window === 'undefined' ? {} : window

//
// global.IPFS = IPFS
// global.setupIPFS = () => {
//   const ipfs = new IPFS({
//     EXPERIMENTAL: { pubsub: true },
//     config: {
//       Addresses: {
//         Swarm: [
//           '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
//           // '/dns4/wrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star',
//         ],
//       },
//     },
//   })
//   global.ipfs = ipfs
//
//   const topic = 'test-test-test!entropy:ml/rfc4566#section-5.2'
//   ipfs.once('ready', () => {
//     console.log('ipfs ready')
//
//     const room = Room(ipfs, 'room-name')
//     window.room = room
//
//     room.on('peer joined', (peer) => {
//       console.log('Peer joined the room', peer)
//     })
//
//     room.on('peer left', (peer) => {
//       console.log('Peer left...', peer)
//     })
//
//     // now started to listen to room
//     room.on('subscribed', () => {
//       console.log('Now connected!')
//     })
//
//     room.on('message', (msg) => {
//       console.log('message', msg)
//     })
//
//   //   ipfs.pubsub.peers('test-test-test!entropy:ml/rfc4566#section-5.2', (err, data) => console.log('PEERS', err, data))
//   //   // Your node is now ready to use \o/
//   //   ipfs.pubsub.subscribe(topic, (msg) => {
//   //     console.log('MESSAGE ', msg)
//   //   }, {discover: true}, (err) => {console.log('SUBSCRIBED?', err)})
//   //   // ipfs.files.cat('QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A', (err, data) => {
//   //   //   if (err) return console.error('ERROR', err)
//   //   //
//   //   //   // convert Buffer back to string
//   //   //   console.log('DATA RETURNED!', data, data.toString('utf8'))
//   //   // })
//   })
// }

// global.getPeers = () => {
//   ipfs.pubsub.peers('test-test-test!entropy:ml/rfc4566#section-5.2', (err, data) => console.log('PEERS', err, data))
// }

//
// global.setupDB = () => {
//   console.log('setting up db 2')
//   const req = indexedDB.open("exampledb", 1);
//   req.onsuccess = () => {
//     console.log('SUCCESS')
//     global.db = req.result;
//   }
//   req.onerror = (e) => {
//     console.log('ERROR', e)
//   }
//   return req
// }

// global.Peer = Peer
// let lastIndex = 1
//
// global.createPeer = (args = {}) => {
//   const index = lastIndex
//   lastIndex = lastIndex + 1
//   const p = new Peer({
//     initiator: true,
//     ...args,
//   })
//
//   p.on('error', function (err) { console.log('error', err) })
//
//   p.on('signal', function (signal) {
//     global.signal = signal
//     // if (signal.sdp != null) {
//     //   const fingerprint = signal.sdp.match(/fingerprint:(.*)/)[1]
//     //   global.fingerprint = fingerprint
//     // }
//     // console.log(index + ' SIGNAL', signal)
//   })
//
//   p.on('connect', () => {
//     console.log(index + ' CONNECTED!')
//   })
//   p.on('data', function (data) {
//     console.log(index + ' data: ' + data)
//   })
//
//   return p
// }
//
// global.setupPeers = () => {
//   const p1 = global.p1 = global.createPeer({ initiator: false })
//   const p2 = global.p2 = global.createPeer({ initiator: true })
//   const p3 = global.p3 = global.createPeer({ initiator: true })
//   p2.on('signal', (signal) => {
//     if (signal.type === 'offer') {
//       p1.signal(signal)
//     }
//   })
//   p3.on('signal', (signal) => {
//     if (signal.type === 'offer') {
//       p1.signal(signal)
//     }
//   })
//   p1.on('signal', (signal) => {
//     if (signal.type === 'answer') {
//       console.log('p1 answer', signal)
//       // p2.signal(signal)
//     }
//   })
// }

// SHARED:

import Promise from 'bluebird'

import Peer from 'simple-peer'
import io from 'socket.io-client'

import keypair from 'keypair'
import forge from 'node-forge'

import { pem2jwk } from 'pem-jwk'
import { Jose, JoseJWE, JoseJWS } from 'jose-jwe-jws'

// import sshFingerprint from 'ssh-fingerprint'

// See https://github.com/square/js-jose/issues/69
(function patchJose() {
  var old = Jose.WebCryptographer.keyId;
  Jose.WebCryptographer.keyId = function(key) { return old({n: key.n, d: key.e});};
})()

const { rsa } = forge.pki

const signallingServer = 'ws://localhost:3000'

// const generateKeypair = () =>  {
//   // crypt = new JSEncrypt({ default_key_size: 4096 })
//   return rsa.generateKeyPair(4096)
//
//   // return {
//   //   privateKey: crypt.getPublicKey(),
//   //   publicKey: crypt.getPrivateKey(),
//   // }
// }

console.log(forge.pki)
global.forge = forge

const sshFingerprint = (publicKey) => {
  const pkiKey = forge.pki.publicKeyFromPem(publicKey)
  return forge.ssh.getPublicKeyFingerprint(pkiKey, {
    encoding: 'hex',
    delimiter: ':',
    md: forge.md.sha256.create(),
  })
}

const packJWS = async ({ payload, privateKey }) => {
  const cryptographer = new Jose.WebCryptographer()
  cryptographer.setContentSignAlgorithm("RS256")

  const jwk = pem2jwk(privateKey)

  const signer = new JoseJWS.Signer(cryptographer)
  await signer.addSigner(jwk)
  const message = await signer.sign(JSON.stringify(payload), null, {})

  return message.CompactSerialize()
}

const unpackJWS = async (message) => {
  let payload = message.split('.')[1]
  payload = atob(payload)
  payload = JSON.parse(payload)

  const { publicKey } = payload
  const fingerprint = sshFingerprint(publicKey, 'sha256')

  const cryptographer = new Jose.WebCryptographer()
  cryptographer.setContentSignAlgorithm("RS256")

  const jwk = pem2jwk(publicKey)

  var verifier = new JoseJWS.Verifier(cryptographer, message)
  await verifier.addRecipient(jwk)
  const verifierResults = await verifier.verify()

  return {
    verified: verifierResults[0].verified,
    payload
  }
}

const encryptSignal = async ({ signal, keys, peerPublicKey }) => {
  const peerFingerprint = sshFingerprint(peerPublicKey, 'sha256')

  const payload = {
    signal,
    publicKey: keys.public,
  }

  const signedPayload = await packJWS({ payload, privateKey: keys.private })

  const jwk = pem2jwk(peerPublicKey)
  const cryptographer = new Jose.WebCryptographer()
  const rsaKey = Jose.Utils.importRsaPublicKey(jwk, "RSA-OAEP")
  const encrypter = new JoseJWE.Encrypter(cryptographer, rsaKey)
  const encryptedPayload = await encrypter.encrypt(signedPayload)

  const message = {
    to: peerFingerprint,
    payload: encryptedPayload,
  }

  console.log('sending', message)

  return message
}

const decryptPayload = async ({ message, keys }) => {
  const encryptedPayload = message.payload
  console.log('received', {encryptedPayload})
  // console.log('private', keys.private)

  // Decrypt the payload
  const jwk = pem2jwk(keys.private)
  const cryptographer = new Jose.WebCryptographer()
  const rsaKey = Jose.Utils.importRsaPrivateKey(jwk, "RSA-OAEP")
  const decrypter = new JoseJWE.Decrypter(cryptographer, rsaKey)
  const signedPayload = await decrypter.decrypt(encryptedPayload)

  const { payload, verified } = await unpackJWS(signedPayload)

  console.log(verified)
  console.log({ payload })

  if (!verified) throw new Error('incorrect signature for message/payload')

  return payload
}

const publishSignal = async ({ socket, signal, keys, peerPublicKey }) => {
  const message = await encryptSignal({ signal, keys, peerPublicKey })
  socket.emit('announcement', message)
}

const connectToSignallingServer = ({ keys }) => {
  console.log('soon')

  const fingerprint = sshFingerprint(keys.public, 'sha256')

  const socket = io(signallingServer, {
    forceNew: true,
    query: {
      fingerprint,
    },
  })

  return new Promise((resolve) => {
    socket.once('connect', () => {
      resolve(socket)
    })
  })
}

global.keypair = keypair
global.clientKeys = keypair({ bits: 1024 }) // TODO: 2048
global.hostKeys = keypair({ bits: 1024 })

// console.log('keys are ', global.clientKeys.public === global.hostKeys.public ? 'BAD!' : 'unique')
//
// console.log('cl', sshFingerprint(global.clientKeys.public), global.clientKeys.public)
// console.log('ho', sshFingerprint(global.hostKeys.public), global.hostKeys.public)


// Client Side

// const connectClient = global.connectClient = async ({ peerPublicKey }) => {
const connectClient = global.connectClient = async ({ keys = global.clientKeys, peerPublicKey = global.hostKeys.public }) => {
  const socket = await connectToSignallingServer({ keys })

  console.log('CONNECTED')
  const p1 = global.p1 = new Peer({ initiator: true })

  p1.on('signal', (signal) => {
    if (signal.type === 'offer') {
      publishSignal({
        socket,
        signal,
        keys,
        peerPublicKey,
      })
      console.log('SIGNAL')

      socket.once('announcement', async (message) => {
        console.log('SO DAMN CLOSE!')
        const payload = await decryptPayload({ message, keys })
        console.log(payload, payload.publicKey, peerPublicKey)

        if (payload.publicKey !== peerPublicKey) return

        console.log('FINAL SIGNAL RECEIVED')
        p1.signal(payload.signal)
      })
    }
  })
}

// HOST SIDE:

const awaitConnection = global.awaitConnection = async ({ keys = global.hostKeys }) => {
  const socket = await connectToSignallingServer({ keys })

  console.log('CONNECTED')

  socket.on('announcement', async (message) => {
    console.log('received ann', message)

    const payload = await decryptPayload({ message, keys })

    // TODO: authenticate the user via the payload's public key

    const rtcPeer = global.p2 = new Peer({ initiator: false })

    rtcPeer.signal(payload.signal)

    rtcPeer.on('signal', (signal) => {
      if (signal.type === 'answer') {
        publishSignal({
          socket,
          signal,
          keys,
          peerPublicKey: payload.publicKey,
        })
      }
    })
  })
}




// const enhance = compose(
// )

// const p = process.browser ? simplePeerTest({initiator:  false}) : null
// <div
//   onClick={() => p.signal(JSON.parse(
//     document.querySelector('#signalInput').value
//   ))}
// >

// const Index = () => (
//   <div style={{ width: 300 }}>
//     <QRReader
//       onScan={scan => {
//         if (scan != null) {
//           console.log('SCAN', scan)
//         }
//       }}
//       style={{ width: '100%' }}
//     />
//   </div>
// )

const Index = () => <div>Web</div>

// export default enhance(Index)

export default Index
