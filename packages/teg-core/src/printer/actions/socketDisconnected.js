export const SOCKET_DISCONNECTED = 'teg/machine/SOCKET_DISCONNECTED'

const socketDisconnected = (machineID) => ({
  type: SOCKET_DISCONNECTED,
  payload: {
    machineID,
  },
})

export default socketDisconnected
