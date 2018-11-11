import { createSelector } from 'reselect'

const getFeedrate = createSelector(
  config => config,
  config => (k) => {
    const { feedrate } = (
      config.axes.get(k)
      || config.machine.components.get(k)
    )

    return feedrate
  },
)

export default getFeedrate
