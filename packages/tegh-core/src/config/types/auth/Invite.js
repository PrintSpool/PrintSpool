import { Record } from 'immutable'
import uuid from 'uuid'
import { ec as EC } from 'elliptic'

const ec = new EC('curve25519')

const InviteFactory = Record({
  id: null,
  type: 'INVITE',
  displayInConsole: false,
  admin: false,
  privateKey: null,
  publicKey: null,
})

const createInvitePrivateKeyPair = () => {
  // Generate keys
  const key = ec.genKeyPair()

  return {
    privateKey: key.getPrivate().toString(16),
    publicKey: key.getPublic().toString(16),
  }
}

const Invite = ({
  id = uuid.v4(),
  ...props
} = {}) => (
  InviteFactory({
    id,
    ...props,
    ...(props.privateKey == null ? createInvitePrivateKeyPair() : {}),
  })
)

export default Invite
