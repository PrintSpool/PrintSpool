import { Record, List } from 'immutable'
import uuid from 'uuid'

import HostConfig from './HostConfig'
import PrinterConfig from './PrinterConfig'
import AuthConfig from './auth/AuthConfig'
import MaterialConfig from './MaterialConfig'

export const MachineRootConfigRecordFactory = Record({
  id: null,
  modelVersion: 0,
  printer: null,
  materials: List(),
})

const MachineRootConfig = ({
  id = uuid.v4(),
  modelVersion = 0,
  printer = {},
  materials = [],
  ...props
} = {}) => (
  MachineRootConfigRecordFactory({
    id,
    modelVersion,
    printer: PrinterConfig(printer),
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
  return MachineRootConfig({
    ...developmentConfig,
    host: {
      ...developmentConfig.host,
      ...host,
    },
    printer: {
      ...developmentConfig.printer,
      ...printer,
    },
    ...props,
  })
}

export default MachineRootConfig
