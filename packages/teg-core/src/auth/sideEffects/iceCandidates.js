import { GraphQLClient } from 'graphql-request'

const iceCandidates = async (source, args, context) => {
  const { user } = context

  const query = `
    query(
      $id: String!
    ) {
      iceCandidates(id: $id) {
        candidate
        sdpMLineIndex
        sdpMid
      }
    }
  `

  const client = new GraphQLClient('http://127.0.0.1:33005/graphql', {
    headers: { 'user-id': user.id },
  })

  const data = await client.request(query, args)

  return data.iceCandidates
  // return data.users.map(u => ({
  //   ...u,
  //   createdAt: Date.parse(u.createdAt),
  //   lastLoggedInAt: u.lastLoggedInAt && Date.parse(u.lastLoggedInAt),
  // }))

}

export default iceCandidates
