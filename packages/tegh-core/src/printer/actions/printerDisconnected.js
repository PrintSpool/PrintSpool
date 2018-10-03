export const PRINTER_DISCONNECTED = 'tegh/status/PRINTER_DISCONNECTED'

const printerDisconnected = ({ resetByMiddleware }) => ({
  type: PRINTER_DISCONNECTED,
  payload: {
    resetByMiddleware,
  },
})

export default printerDisconnected
