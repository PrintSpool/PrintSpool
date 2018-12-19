import { encrypt } from '../p2pCrypto/encryption'

const sendSDP = async ({
  sdp,
  sessionID,
  sessionKey,
  datPeer,
  protocol,
}) => {
  console.log('sending SDP...')
  const data = {
    connection: 'upgrade',
    upgrade: `webrtc-chunk-${protocol}`,
    sdp,
  }
  const encryptedMessage = await encrypt(data, { sessionKey })

  await datPeer.send({
    sessionID,
    data: encryptedMessage,
  })
}

export default sendSDP
