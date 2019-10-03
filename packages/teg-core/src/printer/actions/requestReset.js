export const REQUEST_RESET = 'teg/printer/REQUEST_RESET'

const requestReset = ({ machineID }) => ({
  type: REQUEST_RESET,
  payload: { machineID },
})

export default requestReset
