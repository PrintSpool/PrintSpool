import { request } from 'graphql-request'

const consumeInvite = async ({ peerIdentityPublicKey, user }) => {
  const query = `
    mutation(
      $input: ConsumeInvite!
    ) {
      consumeInvite(
        input: $input
      ) {
        id
        name
        email
        emailVerified
        isAdmin
        createdAt
        lastLoggedInAt
      }
    }
  `

  const variables = {
    input: {
      userID: user.id,
      invitePublicKey: peerIdentityPublicKey,
    },
  }

  const data = await request('http://127.0.0.1:33005/graphql', query, variables)

  return data.consumeInvite
}

export default consumeInvite
