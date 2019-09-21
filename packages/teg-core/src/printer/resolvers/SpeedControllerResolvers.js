const SpeedControllerResolvers = {
  SpeedController: {
    enabled: source => (
      source.targetSpeed != null && source.targetSpeed !== 0
    ),
  },
}

export default SpeedControllerResolvers
