import Peer from 'simple-peer'
import uuidv1 from 'uuid/v1'
import NodeRSA from 'node-rsa'
import ipfs from 'ipfs'


const simplePeerTest = ({ hostPublicKey, sharedSecret }) => {
  const clientPrivateKey = new NodeRSA({b: 4096})
  const clientPublicKey = hostPrivateKey.generateKeyPair()

  console.log('simple peer?', { initiator })
  const p = new Peer({
    initiator: true,
    trickle: false,
  })

  p.on('error', function (err) { console.log('error', err) })

  p.on('signal', function (signal) {
    console.log('SIGNAL', JSON.stringify(signal))

    const encryptedSignal = new NodeRSA(hostPublicKey).encrypt({
      id: uuidv1(),
      clientPublicKey,
      sharedSecret,
      signal,
    })
    console.log('ENCRYPTED', encryptedSignal)
    // await ifps.pubsub.publish(clientPublicKey, encryptedSignal)
  })

  // document.querySelector('form').addEventListener('submit', function (ev) {
  //   ev.preventDefault()
  //   p.signal(JSON.parse(document.querySelector('#incoming').value))
  // })

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

export default simplePeerTest
