import { GraphQLClient } from 'graphql-request'

const invites = async (source, args, context) => {
  const { user } = context

  const query = `
    {
      invites {
        id
        publicKey
        isAdmin
        createdAt
      }
    }
  `

  const client = new GraphQLClient('http://127.0.0.1:33005/graphql', {
    headers: { 'user-id': user.id },
  })

  const data = await client.request(query, args)

  console.log(data)
  return data.invites
}

export default invites
