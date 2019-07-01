import { Record, Map } from 'immutable'
import uuid from 'uuid'

export const ServerConfigFactory = Record({
  id: null,
  modelVersion: 0,
  webRTC: true,
  tcpPort: null,
  unixSocket: null,
  model: Map(),
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
    model: Map(props.model),
  })
)

export default ServerConfig
