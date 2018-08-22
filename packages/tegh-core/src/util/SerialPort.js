import NodeSerialPort from 'serialport'
import { UsbSerial } from 'react-native-usbserial'

const isReactNative = navigator.product === 'ReactNative'

export const getDeviceList = async () => {
  if (isReactNative) {
    const usbs = new UsbSerial()

    const deviceList = await usbs.getDeviceListAsync()
    // const firstDevice = deviceList[0]

    // TODO: format the device list

    return deviceList
  }
  throw new Error('getDeviceList is not yet implemented for PC')
}

const PlatformIndependentSerialPort = (serialID, serialOptions) => {
  if (isReactNative) {
    throw new Error('TODO')
  }
  return SerialPort(serialID, serialOptions)
}

export default PlatformIndependentSerialPort
