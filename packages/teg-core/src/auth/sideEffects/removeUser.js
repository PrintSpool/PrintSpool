import { GraphQLClient } from 'graphql-request'

const consumeInvite = async (args, context) => {
  const { user } = context

  const query = `
    mutation(
      $userID: String!
    ) {
      removeUser(
        userId: $userID
      )
    }
  `

  const client = new GraphQLClient('http://127.0.0.1:33005/graphql', {
    headers: { 'user-id': user.id },
  })

  const data = await client.request(query, args)

  return data.consumeInvite
}

export default consumeInvite
