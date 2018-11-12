import { Record, Map } from 'immutable'
import uuid from 'uuid/v4'

export const ServerConfigFactory = Record({
  signallingServer: 'ws://localhost:3000',
  keys: '~/.tegh/keys.json',
  webRTC: true,
  tcpPort: null,
  unixSocket: null,
  extendedConfig: Map(),
})

const ServerConfig = ({
  id = uuid(),
  ...props
} = {}) => (
  ServerConfigFactory({
    ...props,
    id,
    extendedConfig: Map(props.extendedConfig),
  })
)

export default ServerConfig
