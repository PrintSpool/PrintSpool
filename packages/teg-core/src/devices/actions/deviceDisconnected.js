export const DEVICE_DISCONNECTED = 'teg-core/devices/DEVICE_DISCONNECTED'

const deviceDisconnected = ({ device }) => ({
  type: DEVICE_DISCONNECTED,
  payload: { device },
})

export default deviceDisconnected
