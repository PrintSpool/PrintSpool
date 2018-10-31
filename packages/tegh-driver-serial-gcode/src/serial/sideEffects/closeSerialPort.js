const closeSerialPort = async ({ serialPort }) => {
  if (serialPort.isOpen) {
    await serialPort.close()
  }
}

export default closeSerialPort
