export const REQUEST_ESTOP = 'teg/printer/REQUEST_ESTOP'

const requestEStop = ({ machineID }) => ({
  type: REQUEST_ESTOP,
  payload: { machineID },
})

export default requestEStop
