export const ADD_HOST_IDENTITY = '/tegh-web-ui/ADD_HOST_IDENTITY'

const addHostIdentity = ({ hostIdentity }) => ({
  type: ADD_HOST_IDENTITY,
  payload: { hostIdentity },
})

export default addHostIdentity
