import sendHandshakeRes from './sendHandshakeRes'

const ReceiverHandshake = async ({
  datPeer,
  request,
  identityKeys,
}) => {
  const {
    sessionKey,
  } = await sendHandshakeRes({
    datPeer,
    identityKeys,
    request,
  })

  const { sessionID } = request

  return {
    initiator: false,
    datPeer,
    sessionID,
    sessionKey,
  }
}

export default ReceiverHandshake
