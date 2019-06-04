const os = require('os')

/*
 * This file is used for running the development server and as data for the
 * Jest test cases.
 *
 * WARNING: MAKING CHANGES TO THIS FILE MAY BREAK TEST CASES.
 *
 * Always confirm that you haven't broken anything by running `yarn test` after
 * making any change here.
 */
const printerConfig = {
  id: '0',
  isConfigured: false,
  modelVersion: 1,
  components: [
    {
      // Controller must be the first component for driver test mocks
      id: 'bbbserialController',
      modelVersion: 1,
      type: 'CONTROLLER',
      model: {
        interface: 'SERIAL',
        name: 'RAMPS Controller Board',
        serialPortID: null,
        baudRate: 250000,
        simulate: false,
        delayFromGreetingToReady: 2500,
        temperaturePollingInterval: 1000,
        positionPollingInterval: 500,
        responseTimeoutTickleAttempts: 3,
        fastCodeTimeout: 30000,
        longRunningCodeTimeout: 60000,
        awaitGreetingFromFirmware: true,
        longRunningCodes: [
          'G4',
          'G28',
          'G29',
          'G30',
          'G32',
          'M226',
          'M400',
          'M600',
        ],
      },
    },
    // {
    //   "id": "aaabxzz",
    //   "modelVersion": 1,
    //   "type": "KINEMATICS",
    //   "subType": "CARTESIAN",
    //   "axeIDs" ['x111', 'y111', 'z111']
    // },
    {
      id: 'x',
      modelVersion: 1,
      type: 'AXIS',
      model: {
        address: 'x',
        name: 'X',
        feedrate: 150,
      },
    },
    {
      id: 'y',
      modelVersion: 1,
      type: 'AXIS',
      model: {
        address: 'y',
        name: 'Y',
        feedrate: 150,
      },
    },
    {
      id: 'z',
      modelVersion: 1,
      type: 'AXIS',
      model: {
        address: 'z',
        name: 'Z',
        feedrate: 4,
      },
    },
    {
      id: 'e0',
      modelVersion: 1,
      type: 'TOOLHEAD',
      model: {
        address: 'e0',
        name: 'Extruder 1',
        heater: true,
        feedrate: 3,
        materialID: 'dkdow2',
      },
    },
    {
      id: 'f0',
      modelVersion: 1,
      type: 'FAN',
      model: {
        address: 'f0',
        name: 'Hot End Fan',
      },
    },
    {
      id: 'b',
      modelVersion: 1,
      type: 'BUILD_PLATFORM',
      model: {
        address: 'b',
        name: 'Bed',
        heater: true,
      },
    },
  ],
  plugins: [
    // TODO: move general settings to @tegh/core plugin settings
    {
      id: 'asgbvas23',
      modelVersion: 1,
      package: '@tegh/core',
      model: {
        machineDefinitionURL: 'dat://a295acba915cf57a98854f9f4ecf4be0aa03342a1b814bed591592b611f87e66+preview/definitions/alfawise_u20.def.json',
        name: 'New Printer',
        automaticPrinting: false,
      },
    },
    {
      id: 'aaabbbccc333',
      modelVersion: 1,
      package: '@tegh/driver-serial-gcode',
    },
    {
      id: 'aaabbbccc123',
      modelVersion: 1,
      package: '@tegh/macros-default',
      model: {
        macros: [
          '*',
        ],
      },
    },
  ],
}

// Only add the raspberry pi plugin when running on an ARM CPU
if (['arm', 'arm64'].includes(os.arch())) {
  printerConfig.plugins.push({
    id: 'aa00bb33',
    modelVersion: 1,
    package: '@tegh/raspberry-pi',
    model: {
      outputPins: [
        7,
      ],
      macros: [
        '*',
      ],
    },
  })
}

const hostConfig = {
  id: 'pzxcvkkwn',
  name: 'New Print Farm',
  configDirectory: '~/.tegh/',
  log: {
    id: 'lolcatz95',
    modelVersion: 1,
    maxLength: 1000,
    stderr: [
      // 'info',
      'warning',
      'error',
      'fatal',
    ],
  },
  crashReports: {
    id: 'bfdbdffeews',
    modelVersion: 1,
    directory: '/run/log/tegh',
    uploadCrashReportsToDevs: true,
  },
  server: {
    id: 'vcxbksdkewj',
    modelVersion: 1,
    webRTC: true,
  },
}

const materials = [
  {
    id: 'dkdow2',
    modelVersion: 1,
    type: 'FDM_FILAMENT',
    model: {
      name: 'generic/pla',
      targetExtruderTemperature: 220,
      targetBedTemperature: 60,
    },
  },
  {
    id: 'bw021',
    modelVersion: 1,
    type: 'FDM_FILAMENT',
    model: {
      name: 'generic/abs',
      targetExtruderTemperature: 200,
      targetBedTemperature: 60,
    },
  },
]

const authConfig = {
  invites: [],
  users: [],
  hostIdentityKeys: null,
}

const config = {
  printer: printerConfig,
  host: hostConfig,
  auth: authConfig,
  materials,
}

module.exports = config
