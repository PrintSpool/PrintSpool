import NodeSerialPort from 'serialport'
import { UsbSerial } from 'react-native-usbserial'
import EventEmitter from 'events'

const isReactNative = this.navigator && this.navigator.product === 'ReactNative'

class ReactNativeSerialPort extends EventEmitter {
  constructor(deviceID, serialOptions) {
    super()
    this.deviceID = deviceID
    this.serialOptions = serialOptions
  }

  async open() {
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

const SerialPort = (deviceID, serialOptions) => {
  if (isReactNative) {
    return ReactNativeSerialPort(deviceID, serialOptions)
  }

  return NodeSerialPort(deviceID, serialOptions)
}

SerialPort.getDeviceList = async () => {
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
