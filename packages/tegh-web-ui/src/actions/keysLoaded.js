export const KEYS_LOADED = '/tegh-web-ui/KEYS_LOADED'

const keysLoaded = payload => ({
  type: KEYS_LOADED,
  payload,
})

export default keysLoaded
