import { Record } from 'immutable'
import uuid from 'uuid/v4'

import HostConfig from './HostConfig'
import PrinterConfig from './PrinterConfig'

export const ConfigRecordFactory = Record({
  id: null,
  host: null,
  printer: null,
})

const Config = ({
  id,
  host = {},
  printer = {},
  ...props
}) => (
  ConfigRecordFactory({
    id: id || uuid(),
    host: HostConfig(host),
    printer: PrinterConfig(printer),
    ...props,
  })
)

export const MockConfig = ({
  host = {},
  printer = {},
  ...props
}) => (
  Config({
    host: {
      name: 'test-host',
      ...host,
    },
    printer: {
      name: 'test-printer',
      printerID: uuid(),
      modelID: uuid(),
      ...printer,
    },
    ...props,
  })
)

export default Config
