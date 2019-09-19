export const CREATE_INVITE = 'teg/auth/CREATE_INVITE'

const createInvite = invite => ({
  type: CREATE_INVITE,
  payload: {
    invite,
  },
})

export default createInvite
