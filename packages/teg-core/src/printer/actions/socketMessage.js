export const SOCKET_MESSAGE = 'teg/machine/SOCKET_MESSAGE'

const socketMessage = (machineID, newConnection, message) => ({
  type: SOCKET_MESSAGE,
  payload: {
    message,
    machineID,
    newConnection,
  },
})

export default socketMessage
