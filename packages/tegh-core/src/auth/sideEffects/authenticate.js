/*
* return true to allow the connection if an authorized user can be found with
* the identity public key.
*/
const authenticate = ({ store, peerIdentityPublicKey }) => {
  // eslint-disable-next-line no-console
  console.log(`\n\nNew connection from ${peerIdentityPublicKey}`)

  const user = store.getState().config.auth.users.find(u => (
    u.publicKey === peerIdentityPublicKey
  ))

  if (user == null) return false

  return user
}

export default authenticate
