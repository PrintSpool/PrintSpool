import createHandshakeReq from './createHandshakeReq'

const sendHandshakeReq = async ({
  datPeer,
  identityKeys,
}) => {
  const { ephemeralKeys, request } = await createHandshakeReq({
    identityKeys,
  })

  await datPeer.send(request)

  return {
    ephemeralKeys,
    request,
  }
}

export default sendHandshakeReq
