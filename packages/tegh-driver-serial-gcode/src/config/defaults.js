const defaults = () => ({
  temperaturePollingInterval: 1000,
  delayFromGreetingToReady: 2500,
  serialPort: {
    path: undefined,
    baudRate: 115200,
  },
})

export default defaults
