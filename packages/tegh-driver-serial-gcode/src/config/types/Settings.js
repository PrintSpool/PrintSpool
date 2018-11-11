import { Record, Map, List } from 'immutable'
import { MockConfig } from 'tegh-core'

import packageJSON from '../../../package.json'

const SettingsRecord = Record({
  responseTimeoutTickleAttempts: 3,
  fastCodeTimeout: 30000,
  longRunningCodeTimeout: 60000,
  temperaturePollingInterval: 1000,
  delayFromGreetingToReady: 2500,
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
})

export const createTestConfig = ({
  components = [],
  controller = {},
  settings = {},
}) => MockConfig({
  components: List(components).concat([
    {
      type: 'CONTROLLER',
      interface: 'SERIAL',
      name: 'RAMPS Controller Board',
      serialortID: '/dev/serial/by-id/MY_ARDUINO_SERIAL_NUMBER_ID',
      baudate: 250000,
      simulate: true,
      ...Map(controller).toJS(),
    },
  ]),
  plugins: {
    [packageJSON.name]: {
      package: packageJSON.name,
      settings: SettingsRecord(settings),
    },
  },
})

const Settings = props => SettingsRecord(Map(props).toJS())

export default Settings
