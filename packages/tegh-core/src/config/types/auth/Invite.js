import { Record } from 'immutable'
import uuid from 'uuid'
import { createECDHKey } from 'graphql-things'

const InviteFactory = Record({
  id: null,
  type: 'INVITE',
  displayInConsole: false,
  admin: false,
  keys: null,
})

const Invite = ({
  id = uuid.v4(),
  ...props
} = {}) => (
  InviteFactory({
    id,
    ...props,
  })
)

export const createInvite = async (attrs) => {
  // Generate keys
  const keys = await createECDHKey()
  return Invite({
    keys,
    ...attrs,
  })
}

export default Invite
