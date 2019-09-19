import { createSelector } from 'reselect'
import path from 'path'
import untildify from 'untildify'

const getConfigDirectory = createSelector(
  config => config.host,
  (host) => {
    const normalizedDirectory = path.normalize(untildify(host.configDirectory))

    return normalizedDirectory
  },
)

export default getConfigDirectory
