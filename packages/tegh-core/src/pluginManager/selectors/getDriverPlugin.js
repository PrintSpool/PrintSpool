import { createSelector } from 'reselect'

const getDriverPlugin = createSelector(
  state => state,
  ({ plugins, config }) => (
    plugins.get(config.machine.driver)
  ),
)

export default getDriverPlugin
