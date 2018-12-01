import { Record, Map } from 'immutable'
import uuid from 'uuid'

export const ServerConfigFactory = Record({
  id: null,
  modelVersion: 0,
  signallingServer: 'ws://localhost:3000',
  keys: '~/.tegh/keys.json',
  webRTC: true,
  tcpPort: null,
  unixSocket: null,
  extendedConfig: Map(),
})

const ServerConfig = ({
  id = uuid.v4(),
  modelVersion = 0,
  ...props
} = {}) => (
  ServerConfigFactory({
    ...props,
    id,
    modelVersion,
    extendedConfig: Map(props.extendedConfig),
  })
)

export default ServerConfig
