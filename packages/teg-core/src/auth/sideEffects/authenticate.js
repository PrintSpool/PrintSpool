import { request } from 'graphql-request'

/*
* return true to allow the connection if an authorized user can be found with
* the identity public key.
*/
const authenticate = async ({ peerIdentityPublicKey, authToken }) => {
  // eslint-disable-next-line no-console
  console.log(`\n\nNew connection from ${peerIdentityPublicKey}`)

  const query = `
    mutation(
      $authToken: String!,
      $identityPublicKey: String!
    ) {
      authenticateUser(
        authToken: $authToken,
        identityPublicKey: $identityPublicKey
      ) {
        id
        isAdmin
      }
    }
  `

  const variables = {
    authToken,
    identityPublicKey: peerIdentityPublicKey,
  }

  try {
    console.error('REQUESTING ACCESS')

    const data = await request('http://127.0.0.1:33005/graphql', query, variables)
    const user = data.authenticateUser

    if (user == null) {
      console.error('ACCESS DENIED', data)

      return false
    }

    console.error('AUTHORIZED', { user, peerIdentityPublicKey })

    return { user, peerIdentityPublicKey }
  } catch (e) {
    console.error(e)
    return false
  }
}

export default authenticate
