const defaults = () => ({
  temperaturePollingInterval: 1000,
  delayFromGreetingToReady: 2500,
  serialPort: {
    path: undefined,
    baudRate: undefined,
  },
})

export default defaults
