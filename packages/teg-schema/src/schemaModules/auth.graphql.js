export default `
# Queries

extend type Query {
  invites: [Invite!]!
  users: [User!]!
  iceCandidates(id: ID!): [IceCandidate!]!
}

# Mutations

extend type Mutation {
  createInvite(input: CreateInviteInput!): SetConfigResponse!
  updateInvite(input: UpdateInviteInput!): SetConfigResponse!
  deleteInvite(input: DeleteInviteInput!): Boolean

  consumeInvite: User!

  updateUser(input: UpdateUserInput!): SetConfigResponse!
  deleteUser(input: DeleteUserInput!): Boolean

  deleteCurrentUser: Boolean

  createVideoSDP(offer: RTCSignalInput!): VideoSession!
}

# Video
input RTCSignalInput {
  type: String!
  sdp: String!
}

type VideoSession {
  id: String!
  answer: RTCSignal!
}

type RTCSignal {
  type: String!
  sdp: String!
}

type IceCandidate {
  candidate: String!
  sdpMLineIndex: Int!
  sdpMid: String!
}

# Invite
input CreateInviteInput {
  publicKey: String!
  isAdmin: Boolean!
}

input UpdateInviteInput {
  inviteID: ID!
  isAdmin: Boolean
}

input DeleteInviteInput {
  inviteID: ID!
}

type Invite {
  id: ID!
  publicKey: String!
  isAdmin: Boolean!
  createdAt: DateTime!
}

# User
input UpdateUserInput {
  userID: ID!
  isAdmin: Boolean
}

input DeleteUserInput {
  userID: ID!
}

type User {
  id: ID!
  name: String
  email: String
  emailVerified: Boolean!
  isAdmin: Boolean!
  picture: String
  createdAt: DateTime!
  lastLoggedInAt: DateTime
}
`
