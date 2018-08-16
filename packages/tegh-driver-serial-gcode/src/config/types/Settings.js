import t from 'tcomb-validation'
import { Record, List } from 'immutable'

export const SettingsStruct = t.struct({
  temperaturePollingInterval: t.Integer,
  delayFromGreetingToReady: t.Integer,
  serialTimeout: t.struct({
    tickleAttempts: t.Integer,
    fastCodeTimeout: t.Integer,
    longRunningCodeTimeout: t.Integer,
  }),
  longRunningCodes: t.list(t.String),
  serialPort: t.struct({
    path: t.String,
    baudRate: t.Integer,
    simulation: t.Boolean,
  }),
})

const SettingsRecord = Record({
  temperaturePollingInterval: 1000,
  delayFromGreetingToReady: 2500,
  serialTimeout: Record({
    tickleAttempts: 3,
    fastCodeTimeout: 30000,
    longRunningCodeTimeout: 60000,
  })(),
  longRunningCodes: List([
    'G4',
    'G28',
    'G29',
    'G30',
    'G32',
    'M226',
    'M400',
    'M600',
  ]),
  serialPort: {
    path: null,
    baudRate: 115200,
    simulation: false,
  },
})

const Settings = (props) => {
  const settings = SettingsRecord(props)

  const validation = t.validate(SettingsStruct, settings)

  if (!validation.isValid()) {
    throw new Error(validation.firstError().message)
  }

  return settings
}

export default Settings
