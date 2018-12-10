const DeviceResolvers = {
  Device: {
    type: source => (
      source.type.replace('tegh/devices/type/', '')
    ),
  },
}

export default DeviceResolvers
