export const signallingServer = ({ ws = false } = {}) => {
  const useDevUserProfileServer = true
  // const useDevUserProfileServer = false

  if (
    process.env.NODE_ENV === 'production'
    || useDevUserProfileServer === false
  ) {
    return `${ws ? 'wss://' : 'https://'}signalling.onrender.com`
  } else {
    return `${ws ? 'ws://' : 'http://'}localhost:8080`
  }
}

export const wsBridgeURL = ({ hostSlug, invite, authorization }) => {
  const params = new URLSearchParams({ authorization });
  if (hostSlug != null) {
    params.set('hostSlug', hostSlug)
  }

  if (authorization != null) {
    params.set('authorization', authorization)
  }

  return `${signallingServer({ ws: true })}/bridge/from-client?${params}`
}

const signallingFetchOptions = idToken => (options) => {
  const url = `${signallingServer()}/graphql`

  const headers = new Headers({
    Authorization: `Bearer ${idToken}`,
    'Content-Type': 'application/json',
  })

  Object.assign(options, {
    url,
    mode: 'cors',
    headers,
  })

  return options
}

export default signallingFetchOptions
