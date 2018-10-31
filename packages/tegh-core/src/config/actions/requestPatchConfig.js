import Immutable, { isImmutable } from 'immutable'

export const REQUEST_PATCH_CONFIG = 'tegh-core/config/REQUEST_PATCH_CONFIG'

const requestPatchConfig = (params) => {
  let { patch } = params

  if (isImmutable(patch) === false) patch = Immutable.fromJS(patch)

  return {
    type: REQUEST_PATCH_CONFIG,
    payload: { patch },
  }
}

export default requestPatchConfig
