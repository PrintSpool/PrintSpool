import { Record } from 'immutable'
import uuid from 'uuid'

const InviteFactory = Record({
  id: null,
  displayInConsole: false,
  admin: false,
  privateKey: null,
})

const createInvitePrivateKey = () => {
  // TODO
}

const Invite = ({
  id = uuid.v4(),
  privateKey = createInvitePrivateKey(),
  ...props
} = {}) => (
  InviteFactory({
    id,
    privateKey,
    ...props,
  })
)

export default Invite
