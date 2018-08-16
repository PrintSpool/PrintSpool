import { Record, Map } from 'immutable'
import t from 'tcomb-validation'

import logLevelEnum from '../../log/types/logLevelEnum'

export const configFormStruct = t.struct({
  id: t.String,
  name: t.String,
  macros: t.dict(t.String, t.list(t.String)),
  log: t.sruct({
    maxLength: t.Integer,
    stderr: t.list(t.enums(logLevelEnum)),
  }),
  crashReports: t.struct({
    directory: t.String,
    uploadCrashReportsToDevs: t.Boolean,
  }),
  printFromLocalPath: t.struct({
    enabled: t.Boolean,
    allowSymlinks: t.Boolean,
    whitelist: t.list(t.String),
  }),
  materials: t.dict(t.String, t.struct({
    targetTemperature: t.Number,
    targetBedTemperature: t.Number,
  })),
  machine: t.struct({
    id: t.String,
    driver: t.String,
    axes: t.dict(t.String, t.struct({
      feedrate: t.Number,
    })),
    peripherals: t.dict(t.String, t.struct({
      type: t.emums(['extruder', 'heatedBed', 'heater', 'fan']),
      feedrate: t.Number,
      materialID: t.String,
    })),
  }),
  plugins: t.dict(t.String, t.struct({
    package: t.String,
    settings: t.maybe(t.dict(t.String, t.Any)),
  })),
})

const ConfigForm = (props) => {
  const configForm = Record(
    Map(configFormStruct.meta.props).mapValues(() => null),
  )(props)

  const validation = t.validate(configFormStruct, configForm)

  if (!validation.isValid()) {
    throw new Error(validation.firstError().message)
  }

  return configForm
}

export default ConfigForm
