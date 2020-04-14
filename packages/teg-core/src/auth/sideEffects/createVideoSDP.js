import { GraphQLClient } from 'graphql-request'

const createVideoSDP = async (source, args, context) => {
  const { user } = context

  const query = `
    mutation(
      $offer: RTCSignalInput!
    ) {
      createVideoSDP(
        offer: $offer
      ) {
        id
        answer {
          type
          sdp
        }
      }
    }
  `

  const client = new GraphQLClient('http://127.0.0.1:33005/graphql', {
    headers: { 'user-id': user.id },
  })

  const data = await client.request(query, args)

  return data.createVideoSDP
}

export default createVideoSDP
