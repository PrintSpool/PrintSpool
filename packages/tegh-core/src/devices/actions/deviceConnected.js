export const DEVICE_CONNECTED = 'tegh-core/devices/DEVICE_CONNECTED'

const deviceConnected = ({ device }) => ({
  type: DEVICE_CONNECTED,
  payload: { device },
})

export default deviceConnected
