import NodeSerialPort from 'serialport'
import EventEmitter from 'events'

const isReactNative = (
  typeof navigator !== 'undefined'
  // eslint-disable-next-line no-undef
  && navigator.product === 'ReactNative'
)

// In ReactNative environments UsbSerial must be set. eg:
// import { serialConfig } from '@tegh/core'
// import { UsbSerial } from 'react-native-usbserial'
// serialConfig.UsbSerial = UsbSerial

class ReactNativeSerialPort extends EventEmitter {
  constructor(deviceID, serialOptions) {
    super()
    this.deviceID = deviceID
    this.serialOptions = serialOptions
  }

  async open({ UsbSerial }) {
    const serialModule = this.device.UsbSerialModule

    this.device = await UsbSerial.openDeviceAsync(this.deviceID)
    serialModule.on('newData', this.onNewData)
    this.emit('open')
  }

  write(value, cb) {
    this.device.writeAsync(value).then(cb)
  }

  async onNewData() {
    const serialModule = this.device.UsbSerialModule

    const data = await serialModule.readDeviceAsync(this.deviceID)
    if (data != null) this.emit('data', data)
  }
}

const SerialPort = (() => {
  if (isReactNative) {
    return ReactNativeSerialPort
  }
  return NodeSerialPort
})()

SerialPort.getDeviceList = async ({ UsbSerial }) => {
  if (isReactNative) {
    const usbs = new UsbSerial()

    const deviceList = await usbs.getDeviceListAsync()
    // const firstDevice = deviceList[0]

    // TODO: format the device list

    return deviceList
  }

  return NodeSerialPort.list()
}

export default SerialPort
