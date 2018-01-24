const hasTemperatureDataPattern = ({ type, data = null }) => (
  type === 'SERIAL_RECEIVE'
  && data
  && data.type === 'ok'
  && data.temperatures != null
)

export default hasTemperatureDataPattern
