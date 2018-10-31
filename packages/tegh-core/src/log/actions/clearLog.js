export const CLEAR_LOG = 'tegh/log/CLEAR_LOG'

const clearLog = () => {
  const action = {
    type: CLEAR_LOG,
  }
  return action
}

export default clearLog
