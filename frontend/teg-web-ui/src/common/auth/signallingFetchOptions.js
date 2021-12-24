
const signallingFetchOptions = idToken => (options) => {
  let url

  const useDevUserProfileServer = true
  // const useDevUserProfileServer = false

  if (
    process.env.NODE_ENV === 'production'
    || useDevUserProfileServer === false
  ) {
    url = 'https://signalling.onrender.com/graphql'
  } else {
    url = 'http://localhost:8080/graphql'
  }

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
