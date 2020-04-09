
const userProfileServerFetchOptions = idToken => (options) => {
  let url

  const useDevUserProfileServer = false

  if (
    process.env.NODE_ENV === 'production'
    || useDevUserProfileServer === false
  ) {
    url = 'https://app-f49757b3-f48d-4078-8e8c-47b27b8b9d6d.cleverapps.io/graphql'
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
}

export default userProfileServerFetchOptions
