import { Record, Map } from 'immutable'
import t from 'tcomb-validation'

import LogConfig, { LogConfigStruct } from './LogConfig'
import CrashReportConfig, { CrashReportConfigStruct } from './CrashReportConfig'
import PrintFromLocalPathConfig, { PrintFromLocalPathConfigStruct } from './PrintFromLocalPathConfig'
import PluginConfig, { PluginConfigStruct } from './PluginConfig'
import MachineConfig, { MachineConfigStruct } from './MachineConfig'
import MaterialConfig, { MaterialConfigStruct } from './MaterialConfig'

export const configFormStructFields = {
  id: t.String,
  name: t.String,
  macros: t.dict(t.String, t.list(t.String)),
  log: LogConfigStruct,
  crashReports: CrashReportConfigStruct,
  printFromLocalPath: PrintFromLocalPathConfigStruct,
  materials: t.dict(t.String, MaterialConfigStruct),
  machine: MachineConfigStruct,
  plugins: t.dict(t.String, PluginConfigStruct),
}

export const ConfigFormStruct = t.struct(configFormStructFields)

export const ConfigFormRecordFactory = Record(
  Map(ConfigFormStruct.meta.props).map(() => null),
)

const mapOfRecords = (entries, recordFactory) => (
  Map(entries).map(props => recordFactory(props))
)

const ConfigForm = props => ConfigFormRecordFactory({
  ...props,
  log: LogConfig(props.log),
  crashReports: CrashReportConfig(props.crashReports),
  printFromLocalPath: PrintFromLocalPathConfig(props.printFromLocalPath),
  plugins: mapOfRecords(props.plugins, PluginConfig),
  machine: MachineConfig(props.machine),
  materials: mapOfRecords(props.materials, MaterialConfig),
})

export default ConfigForm
