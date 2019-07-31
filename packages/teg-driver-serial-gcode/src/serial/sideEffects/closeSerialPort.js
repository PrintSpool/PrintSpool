const closeSerialPort = async ({ serialPort }) => {
  if (serialPort != null && serialPort.isOpen) {
    await serialPort.close()
  }
}

export default closeSerialPort
