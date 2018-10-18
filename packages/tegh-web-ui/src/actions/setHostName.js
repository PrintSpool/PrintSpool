export const SET_HOST_NAME = '/tegh-web-ui/SET_HOST_NAME'

const setHostName = ({ id, name }) => ({
  type: SET_HOST_NAME,
  payload: {
    host: {
      id,
      name,
    },
  },
})

export default setHostName
