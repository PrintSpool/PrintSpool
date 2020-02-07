import { GraphQLClient } from 'graphql-request'

const createInvite = async (source, args, context) => {
  const { user } = context

  const query = `
    {
      users {
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

  const client = new GraphQLClient('http://127.0.0.1:33005/graphql', {
    headers: { 'user-id': user.id },
  })

  const data = await client.request(query, args)

  return data.users.map(u => ({
    ...u,
    createdAt: new Date(u.createdAt * 1000),
    lastLoggedInAt: u.lastLoggedInAt && new Date(u.lastLoggedInAt * 1000),
  }))

}

export default createInvite
