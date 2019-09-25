export const SEND_TASK_TO_SOCKET = 'teg/printer/SEND_TASK_TO_SOCKET'

const sendTaskToSocket = task => ({
  type: SEND_TASK_TO_SOCKET,
  payload: { task },
})

export default sendTaskToSocket
