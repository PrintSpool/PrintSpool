import t from 'tcomb-validation'
import { Record, Map, List } from 'immutable'
import { MockConfig } from 'tegh-core'

import packageJSON from '../../../package.json'

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
    portID: t.String,
    baudRate: t.Integer,
    simulation: t.Boolean,
  }),
})

const SerialTimeoutRecord = Record({
  tickleAttempts: 3,
  fastCodeTimeout: 30000,
  longRunningCodeTimeout: 60000,
})

const SerialPortRecord = Record({
  portID: null,
  baudRate: 115200,
  simulation: false,
})

const SettingsRecord = Record({
  temperaturePollingInterval: 1000,
  delayFromGreetingToReady: 2500,
  serialTimeout: SerialTimeoutRecord(),
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
  serialPort: SerialPortRecord(),
})

export const createTestConfig = props => MockConfig({
  machine: {
    driver: packageJSON.name,
  },
  plugins: {
    [packageJSON.name]: {
      package: packageJSON.name,
      settings: SettingsRecord(props),
    },
  },
})

const Settings = (props) => {
  const propsJS = Map(props).toJS()

  const settings = SettingsRecord({
    ...propsJS,
    serialTimeout: SerialTimeoutRecord(propsJS.serialTimeout),
    serialPort: SerialPortRecord(propsJS.serialPort),
  })

  const validation = t.validate(settings.toJS(), SettingsStruct)

  if (!validation.isValid()) {
    throw new Error(validation.firstError().message)
  }

  return settings
}

export default Settings
