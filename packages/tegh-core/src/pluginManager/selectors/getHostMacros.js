import { createSelector } from 'reselect'

const getHostMacros = createSelector(
  ({ plugins }) => plugins,
  plugins => (
    plugins
      .map(plugin => plugin.macros)
      .filter(macros => macros != null)
      .flatten()
  ),
)

export default getHostMacros
