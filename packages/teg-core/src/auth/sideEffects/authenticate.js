import { request } from 'graphql-request'

/*
* return true to allow the connection if an authorized user can be found with
* the identity public key.
*/
const authenticate = async ({ peerIdentityPublicKey, authToken }) => {
  // eslint-disable-next-line no-console
  console.log(`\n\nNew connection from ${peerIdentityPublicKey}`)

  console.log({ authToken })


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
        userProfileId
        isAdmin
        isAuthorized
      }
    }
  `

  const variables = {
    authToken,
    identityPublicKey: peerIdentityPublicKey,
  }

  try {
    const data = await request('http://127.0.0.1:33005/graphql', query, variables)
    const user = data.authenticateUser

    console.error({ data })
    return { user, peerIdentityPublicKey }
  } catch(e) {
    console.error(e)
    return false
  }
}

export default authenticate
