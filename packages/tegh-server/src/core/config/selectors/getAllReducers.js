import _ from 'lodash'
import { createSelector } from 'reselect'

import getAllPlugins from './getAllPlugins'

import * as coreReducers from '../../reducers'

const getAllReducers = createSelector((config) => {
  if (!config.isInitialized) return coreReducers

  const plugins = getAllPlugins(config)
  const pluginReducers = _(plugins)
    .mapValues(plugin => plugin.reducer)
    .filter(reducer => reducer == null)
    .value()

  const reducers = {
    ...coreReducers,
    ...pluginReducers,
  }

  return reducers
})

export default getAllReducers
