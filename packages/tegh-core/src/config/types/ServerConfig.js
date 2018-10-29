import { Record } from 'immutable'
import uuid from 'uuid/v4'

export const ServerConfigFactory = Record({
  signallingServer: 'ws://localhost:3000',
  keys: '~/.tegh/keys.json',
  webRTC: true,
  tcpPort: null,
  unixSocket: null,
})

const ServerConfig = props => (
  ServerConfigFactory({
    id: props.id || uuid(),
    ...props,
  })
)

export default ServerConfig
