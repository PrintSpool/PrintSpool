export const DRIVER_ERROR = 'tegh/status/DRIVER_ERROR'

const driverError = ({ code, message }) => {
  if (typeof code !== 'string') {
    throw new Error('error code must be a string')
  }
  if (typeof message !== 'string') {
    throw new Error('error message must be a string')
  }
  return {
    type: DRIVER_ERROR,
    payload: {
      code,
      message,
    },
  }
}

export default driverError
