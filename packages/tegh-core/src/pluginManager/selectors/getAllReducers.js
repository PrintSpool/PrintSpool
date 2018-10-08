import { createSelector } from 'reselect'

import * as coreReducers from '../../reducers'

const getAllReducers = createSelector(
  ({ plugins }) => plugins,
  plugins => (
    plugins
      .mapValues(plugin => plugin.reducer)
      .filter(reducers => reducers != null)
      .concat(coreReducers)
  ),
)

export default getAllReducers
