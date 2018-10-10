import { createSelector } from 'reselect'

import * as coreReducers from '../../reducers'

const getAllReducers = createSelector(
  ({ plugins }) => plugins,
  plugins => (
    plugins
      .map(plugin => plugin.reducer)
      .filter(reducers => reducers != null)
      .concat(coreReducers)
  ),
)

export default getAllReducers
