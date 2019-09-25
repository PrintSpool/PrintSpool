export const SEND_DELETE_TASK_HISTORY_TO_SOCKET = 'teg/printer/SEND_DELETE_TASK_HISTORY_TO_SOCKET'

const sendDeleteTaskHistoryToSocket = ({ machineID, taskIDs }) => ({
  type: SEND_DELETE_TASK_HISTORY_TO_SOCKET,
  payload: { machineID, taskIDs },
})

export default sendDeleteTaskHistoryToSocket
