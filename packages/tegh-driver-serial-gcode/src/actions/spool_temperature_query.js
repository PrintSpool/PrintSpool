const spoolTemperatureQuery = () => ({
  type: 'SPOOL',
  spoolID: 'internalSpool',
  data: ['M105'],
})

export default spoolTemperatureQuery
