import parseHandshakeReq from './parseHandshakeReq'

const sendHandshakeRes = async ({
  currentConnection,
  identityKeys,
  request,
}) => {
  const { response, sessionKey } = await parseHandshakeReq({
    request,
    identityKeys,
  })

  await currentConnection.send(response)

  return {
    response,
    sessionKey,
  }
}

export default sendHandshakeRes
