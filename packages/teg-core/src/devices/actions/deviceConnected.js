export const DEVICE_CONNECTED = 'teg-core/devices/DEVICE_CONNECTED'

const deviceConnected = ({ device }) => ({
  type: DEVICE_CONNECTED,
  payload: { device },
})

export default deviceConnected
