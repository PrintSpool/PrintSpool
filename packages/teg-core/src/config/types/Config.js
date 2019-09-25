import { Record, List, Map } from 'immutable'
import uuid from 'uuid'

import HostConfig from './HostConfig'
import PrinterConfig from './PrinterConfig'
import AuthConfig from './auth/AuthConfig'
import MaterialConfig from './MaterialConfig'

export const ConfigRecordFactory = Record({
  id: null,
  modelVersion: 0,
  host: null,
  printer: null,
  machines: Map(),
  auth: null,
  materials: List(),
})

const Config = ({
  id = uuid.v4(),
  modelVersion = 0,
  host = {},
  printer = {},
  auth = {},
  materials = [],
  ...props
} = {}) => {
  const printerConfig = PrinterConfig(printer)

  return ConfigRecordFactory({
    id,
    modelVersion,
    host: HostConfig(host),
    printer: printerConfig,
    machines: Map({ [printerConfig.id]: printerConfig }),
    auth: AuthConfig(auth),
    materials: List(materials).map(MaterialConfig),
    ...props,
  })
}

export const MockConfig = ({
  host = {},
  printer = {},
  ...props
} = {}) => {
  // eslint-disable-next-line global-require
  const developmentConfig = require('../../../../development.config')
  return Config({
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

export default Config
