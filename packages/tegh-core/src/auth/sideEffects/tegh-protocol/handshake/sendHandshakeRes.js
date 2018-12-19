import createHandshakeRes from './createHandshakeRes'

const sendHandshakeRes = async ({
  datPeer,
  identityKeys,
  request,
}) => {
  const { response, sessionKey } = await createHandshakeRes({
    request,
    identityKeys,
  })

  await datPeer.send(response)

  return {
    response,
    sessionKey,
  }
}

export default sendHandshakeRes
