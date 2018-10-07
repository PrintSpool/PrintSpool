import _ from 'lodash'

import setConfig from './setConfig'
import setPluginLoaderPath from '../../pluginManager/actions/setPluginLoaderPath'

const initializeConfig = ({
  configForm,
  pluginLoaderPath,
}) => async (dispatch) => {
  const { server } = configForm

  await dispatch(setPluginLoaderPath({
    pluginLoaderPath,
  }))

  console.log('123', _.omit(configForm, ['server']))
  await dispatch(setConfig({
    configForm: _.omit(configForm, ['server']),
    server,
  }))
}

export default initializeConfig
