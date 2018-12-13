import Invite from '../../config/types/auth/Invite'

export const CREATE_INVITE = 'tegh/auth/CREATE_INVITE'

const createInvite = inviteParams => ({
  type: CREATE_INVITE,
  payload: {
    invite: Invite(inviteParams),
  },
})

export default createInvite
