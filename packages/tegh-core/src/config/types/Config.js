import { Record, List } from 'immutable'
import uuid from 'uuid/v4'

import HostConfig from './HostConfig'
import PrinterConfig from './PrinterConfig'
import MaterialConfig from './MaterialConfig'
import developmentConfig from '../../../../../development.config'

export const ConfigRecordFactory = Record({
  id: null,
  modelVersion: 0,
  host: null,
  printer: null,
  materials: List(),
})

const Config = ({
  id = uuid(),
  modelVersion = 0,
  host = {},
  printer = {},
  materials = [],
  ...props
} = {}) => (
  ConfigRecordFactory({
    id,
    modelVersion,
    host: HostConfig(host),
    printer: PrinterConfig(printer),
    materials: List(materials).map(material => MaterialConfig(material)),
    ...props,
  })
)

export const MockConfig = ({
  host = {},
  printer = {},
  ...props
} = {}) => (
  Config({
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
)

export default Config
