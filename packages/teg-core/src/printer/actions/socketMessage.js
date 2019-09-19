export const SOCKET_MESSAGE = 'teg/machine/SOCKET_MESSAGE'

const socketMessage = (machineID, message) => ({
  type: SOCKET_MESSAGE,
  payload: {
    message,
    machineID,
  },
})

export default socketMessage
