import t from 'tcomb'
import { Record, List } from 'immutable'

export const validation = t.struct({
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

const Settings = Record({
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

export default Settings
