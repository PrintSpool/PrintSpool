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
        email
        emailVerified
        isAdmin
        picture
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

  let createdUser = data.consumeInvite

  createdUser = {
    ...createdUser,
    createdAt: Date.parse(createdUser.createdAt),
    lastLoggedInAt: createdUser.lastLoggedInAt && Date.parse(createdUser.lastLoggedInAt),
  }

  return createdUser
}

export default consumeInvite
