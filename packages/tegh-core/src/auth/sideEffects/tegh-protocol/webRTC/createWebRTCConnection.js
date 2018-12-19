import {
  createECDHKey,
  createHandshakeRequest,
  createHandshakeResponse,
  createSessionKey,
  encrypt,
  decrypt,
} from './p2pSessionNode'

const createWebRTCConnection = async ({
  datPeer,
  sessionID,
  sessionKey,
  peerSDP,
}) => {
  // TODO: create webRTC + sdp and bind the webRTC peer to the subscription server
  const data = { sdp }
  const encryptedMessage = await encrypt(data, { sessionKey })

  await datPeer.send({
    sessionID,
    data: encryptedMessage,
  })

  return {
    response,
    sessionKey,
  }
}

export default createWebRTCConnection
