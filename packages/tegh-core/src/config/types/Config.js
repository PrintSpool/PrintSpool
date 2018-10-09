import { Record, Map } from 'immutable'
import t from 'tcomb-validation'
import uuid from 'uuid/v4'

import LogConfig, { LogConfigStruct } from './LogConfig'
import CrashReportConfig, { CrashReportConfigStruct } from './CrashReportConfig'
import PrintFromLocalPathConfig, { PrintFromLocalPathConfigStruct } from './PrintFromLocalPathConfig'
import PluginConfig, { PluginConfigStruct } from './PluginConfig'
import MachineConfig, { MachineConfigStruct } from './MachineConfig'
import MaterialConfig, { MaterialConfigStruct } from './MaterialConfig'

export const ConfigStruct = t.struct({
  id: t.String,
  name: t.String,
  macros: t.dict(t.String, t.list(t.String)),
  log: LogConfigStruct,
  crashReports: CrashReportConfigStruct,
  printFromLocalPath: PrintFromLocalPathConfigStruct,
  materials: t.dict(t.String, MaterialConfigStruct),
  machine: MachineConfigStruct,
  plugins: t.dict(t.String, PluginConfigStruct),
})

export const ConfigRecordFactory = Record(
  Map(ConfigStruct.meta.props).map(() => null).toJS(),
)

const mapOfRecords = (entries = {}, recordFactory) => (
  Map(entries).map(props => recordFactory(props))
)

const Config = (props = {}) => (
  ConfigRecordFactory({
    ...props,
    macros: props.macros || {},
    log: LogConfig(props.log),
    crashReports: CrashReportConfig(props.crashReports),
    printFromLocalPath: PrintFromLocalPathConfig(props.printFromLocalPath),
    plugins: mapOfRecords(props.plugins, PluginConfig),
    machine: MachineConfig(props.machine),
    materials: mapOfRecords(props.materials, MaterialConfig),
  })
)

export const MockConfig = (props = {}) => (
  Config({
    id: uuid(),
    name: 'test-printer',
    ...props,
    machine: {
      id: uuid(),
      driver: 'test-driver',
      ...(props.machine || {}),
    },
  })
)

export const validateCoreConfig = (config) => {
  const validation = t.validate(config.toJS(), ConfigStruct)

  if (!validation.isValid()) {
    throw new Error(validation.firstError().message)
  }
}

export default Config
