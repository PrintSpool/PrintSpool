import immutablePatch from 'immutablepatch'

import setConfig from './setConfig'

const updateConfig = ({
  patch,
}) => (
  async (dispatch, getState) => {
    const configForm = immutablePatch(getState().config.configForm, patch)

    const action = setConfig({ configForm })

    return dispatch(action)
  }
)

export default updateConfig
