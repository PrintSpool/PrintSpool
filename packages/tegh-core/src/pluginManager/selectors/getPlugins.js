import { createSelector } from 'reselect'

const getPlugins = createSelector(
  setConfigPayload => setConfigPayload,
  ({ plugins }) => plugins,
)

export default getPlugins
