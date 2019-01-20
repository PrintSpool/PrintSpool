export const CREATE_INVITE = 'tegh/auth/CREATE_INVITE'

const createInvite = invite => ({
  type: CREATE_INVITE,
  payload: {
    invite,
  },
})

export default createInvite
