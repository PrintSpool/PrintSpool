export const DRIVER_ERROR = 'teg/status/DRIVER_ERROR'

const driverError = ({ code, message, stack }) => {
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
      stack,
    },
  }
}

export default driverError
