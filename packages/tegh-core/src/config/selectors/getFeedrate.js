import { createSelector } from 'reselect'

const getFeedrate = createSelector(
  config => config,
  config => (k) => {
    const { feedrate } = (
      config.machine.axes.get(k)
      || config.machine.peripherals.get(k)
    )

    return feedrate
  },
)

export default getFeedrate
