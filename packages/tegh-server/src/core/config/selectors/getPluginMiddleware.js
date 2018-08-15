import _ from 'lodash'
import { createSelector } from 'reselect'

import getAllPlugins from './getAllPlugins'

import * as coreReducers from '../../reducers'

const getPluginMiddleware = createSelector((config) => {
  if (!config.isInitialized) return coreReducers

  const plugins = getAllPlugins(config)
  const pluginMiddleware = _(plugins)
    .mapValues(plugin => plugin.middleware)
    .filter(middleware => middleware == null)
    .value()

  return pluginMiddleware
})

export default getPluginMiddleware
