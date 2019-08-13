import { Record, List } from 'immutable'
import uuid from 'uuid'

import HostConfig from './HostConfig'
import MachineConfig from './MachineConfig'
import AuthConfig from './auth/AuthConfig'
import MaterialConfig from './MaterialConfig'

export const CombinatorRootConfigRecordFactory = Record({
  id: null,
  modelVersion: 0,
  host: null,
  printer: null,
  auth: null,
  materials: List(),
})

const CombinatorRootConfig = ({
  id = uuid.v4(),
  modelVersion = 0,
  host = {},
  machines = [],
  auth = {},
  materials = [],
  ...props
} = {}) => (
  CombinatorRootConfigRecordFactory({
    id,
    modelVersion,
    host: HostConfig(host),
    machines: machines.map(MachineConfig),
    auth: AuthConfig(auth),
    materials: List(materials).map(material => MaterialConfig(material)),
    ...props,
  })
)

export const MockConfig = ({
  host = {},
  printer = {},
  ...props
} = {}) => {
  // eslint-disable-next-line global-require
  const developmentConfig = require('../../../../development.config')
  return CombinatorRootConfig({
    ...developmentConfig,
    host: {
      ...developmentConfig.host,
      ...host,
    },
    machines: [{
      ...developmentConfig.printer,
      ...printer,
    }],
    ...props,
  })
}

export default CombinatorRootConfig
