import { Record } from 'immutable'

import { SERIAL_PORT } from './DeviceTypeEnum'

const DeviceRecord = Record({
  id: null,
  type: null,
  connected: false,
  simulated: false,
})

const Device = DeviceRecord

export const MockDevice = () => Device({
  id: '/dev/serial-by-id/mock_device_id',
  type: SERIAL_PORT,
  connected: true,
})

export default Device
