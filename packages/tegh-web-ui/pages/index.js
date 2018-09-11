// import { compose, withContext } from 'recompose'
import QRReader from 'react-qr-reader'

const global = typeof window === 'undefined' ? {} : window

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

const signallingServer = 'ws://localhost:3000'

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

  return message
}

const decryptPayload = async ({ message, keys }) => {
  const encryptedPayload = message.payload

  // Decrypt the payload
  const jwk = pem2jwk(keys.private)
  const cryptographer = new Jose.WebCryptographer()
  const rsaKey = Jose.Utils.importRsaPrivateKey(jwk, "RSA-OAEP")
  const decrypter = new JoseJWE.Decrypter(cryptographer, rsaKey)
  const signedPayload = await decrypter.decrypt(encryptedPayload)

  const { payload, verified } = await unpackJWS(signedPayload)

  if (!verified) throw new Error('incorrect signature for message/payload')

  return payload
}

const publishSignal = async ({ socket, signal, keys, peerPublicKey }) => {
  const message = await encryptSignal({ signal, keys, peerPublicKey })
  socket.emit('announcement', message)
}

const connectToSignallingServer = ({ keys }) => {
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


// Client Side

// const connectClient = global.connectClient = async ({ peerPublicKey }) => {
const connectClient = global.connectClient = async ({ keys = global.clientKeys, peerPublicKey = global.hostKeys.public }) => {
  const socket = await connectToSignallingServer({ keys })

  const rtcPeer = global.p1 = new Peer({ initiator: true })

  rtcPeer.on('signal', (signal) => {
    if (signal.type === 'offer') {
      publishSignal({
        socket,
        signal,
        keys,
        peerPublicKey,
      })

      socket.once('announcement', async (message) => {
        const payload = await decryptPayload({ message, keys })

        if (payload.publicKey !== peerPublicKey) return

        console.log('connecting...')
        rtcPeer.signal(payload.signal)
      })
    }
  })

  rtcPeer.on('connect', () => {
    console.log('CLIENT RTC CONNECTED')
    rtcPeer.send('test message from client')
  })
}

// HOST SIDE:

const awaitConnection = global.awaitConnection = async ({ keys = global.hostKeys }) => {
  const socket = await connectToSignallingServer({ keys })

  socket.on('announcement', async (message) => {
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

    rtcPeer.on('connect', () => {
      console.log('HOST RTC CONNECTED')
    })

    rtcPeer.on('data', (data) => {
      // got a data channel message
      console.log('got a message from client: ' + data)
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
