export default const spoolTemperatureQuery = () => ({
  type: 'SPOOL',
  spoolID: 'internalSpool',
  data: 'M105',
})
