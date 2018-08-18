export const REQUEST_PATCH_CONFIG = 'tegh-core/config/REQUEST_PATCH_CONFIG'

const requestPatchConfig = ({ patch }) => ({
  type: REQUEST_PATCH_CONFIG,
  payload: { patch },
})

export default requestPatchConfig
