import { encrypt } from '../p2pCrypto/encryption'

const sendSDP = async ({
  currentConnection,
  sdp,
  protocol,
}) => {
  console.log('sending SDP...')
  // const encryptedMessage = await encrypt(data, { sessionKey })

  // await currentConnection.send({
  //   sessionID,
  //   data: encryptedMessage,
  // })
  await currentConnection.send({
    connection: 'upgrade',
    upgrade: `webrtc-chunk-${protocol}`,
    sdp,
  })
}

export default sendSDP
