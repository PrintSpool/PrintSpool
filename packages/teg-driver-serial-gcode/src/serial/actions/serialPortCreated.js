export const SERIAL_PORT_CREATED = 'teg-driver-gcode/serial/SERIAL_PORT_CREATED'

const serialPortCreated = ({ serialPort }) => ({
  type: SERIAL_PORT_CREATED,
  payload: {
    serialPort,
  },
})

export default serialPortCreated
