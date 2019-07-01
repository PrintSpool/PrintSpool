import { Record } from 'immutable'
import uuid from 'uuid'
import { createECDHKey, getInviteCode } from 'graphql-things'

const InviteFactory = Record({
  id: null,
  type: 'INVITE',
  displayInConsole: false,
  admin: false,
  code: null,
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

export const initInviteWithKeys = async ({
  hostIdentityKeys,
  ...attrs
}) => {
  // Generate keys
  const keys = await createECDHKey()
  const code = getInviteCode({
    identityKeys: hostIdentityKeys,
    inviteKeys: keys,
  })
  return Invite({
    keys,
    code,
    ...attrs,
  })
}

export default Invite
