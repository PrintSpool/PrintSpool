import { Record, Map } from 'immutable'
import t from 'tcomb-validation'

/* HTTP Port / Unix Socket configuration */
export const ServerSettingsStruct = t.struct({
  signallingServer: t.maybe(t.String),
  keys: t.maybe(t.String),
  webRTC: t.maybe(t.Boolean),
  tcpPort: t.maybe(t.Number),
  unixSocket: t.maybe(t.String),
})

const defaultValues = Map(ServerSettingsStruct.meta.props)
  .map(() => null)
  .toObject()

const ServerSettings = Record(defaultValues)

export default ServerSettings
