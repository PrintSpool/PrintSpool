import parseHandshakeReq from './parseHandshakeReq'

const sendHandshakeRes = async ({
  datPeer,
  identityKeys,
  request,
}) => {
  const { response, sessionKey } = await parseHandshakeReq({
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
