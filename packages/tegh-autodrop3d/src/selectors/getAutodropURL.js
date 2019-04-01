import { URL, URLSearchParams } from 'url'

const DEFAULT_URL = (
  'https://autodrop.sparkhosted.site/api/jobsQueue/printerRequestJob'
)

const getAutodropURL = ({ config, params = {} }) => {
  const {
    deviceID,
    deviceKey,
  } = config

  const url = new URL(config.apiURL || DEFAULT_URL)

  url.search = new URLSearchParams({
    name: deviceID,
    key: deviceKey,
    ...params,
  })

  return url.toString()
}

export default getAutodropURL
