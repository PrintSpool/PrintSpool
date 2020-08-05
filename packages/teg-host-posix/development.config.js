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
  id: '1',
  isConfigured: false,
  modelVersion: 1,
  components: [
    {
      // Controller must be the first component for driver test mocks
      id: '1',
      modelVersion: 1,
      type: 'CONTROLLER',
      model: {
        interface: 'SERIAL',
        name: 'RAMPS Controller Board',

        serialPortID: '/dev/null/no-serial-port',

        automaticBaudRateDetection: true,
        baudRate: 250000,

        simulate: false,
        awaitGreetingFromFirmware: true,
        checksumTickles: false,
        gcodeHistoryBufferSize: 20,

        serialConnectionTimeout: 3000,
        delayFromGreetingToReady: 2000,
        pollingInterval: 500,
        responseTimeoutTickleAttempts: 3,
        fastCodeTimeout: 30000,
        longRunningCodeTimeout: 60000,

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
        blockingCodes: [
          'M0',
          'M1',
          'M21',
          'M109',
          'M116',
          'M190',
          'M191',
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
      id: '2',
      modelVersion: 1,
      type: 'AXIS',
      model: {
        address: 'x',
        name: 'X',
        feedrate: 150,
      },
    },
    {
      id: '3',
      modelVersion: 1,
      type: 'AXIS',
      model: {
        address: 'y',
        name: 'Y',
        feedrate: 150,
      },
    },
    {
      id: '4',
      modelVersion: 1,
      type: 'AXIS',
      model: {
        address: 'z',
        name: 'Z',
        feedrate: 4,
      },
    },
    {
      id: '5',
      modelVersion: 1,
      type: 'TOOLHEAD',
      model: {
        address: 'e0',
        name: 'Extruder 1',
        heater: true,
        feedrate: 3,
        materialID: 'dkdow2',
        bowdenTubeLength: 0,
        filamentSwapFastMoveSpeed: 100,
        filamentSwapFastMoveEnabled: false,
        filamentSwapExtrudeDistance: 50,
      },
    },
    {
      id: '6',
      modelVersion: 1,
      type: 'FAN',
      model: {
        address: 'f0',
        name: 'Hot End Fan',
      },
    },
    {
      id: '7',
      modelVersion: 1,
      type: 'BUILD_PLATFORM',
      model: {
        address: 'b',
        name: 'Bed',
        heater: true,
      },
    },
    // // Video Feed Example
    // {
    //   id: '8',
    //   modelVersion: 1,
    //   type: 'VIDEO',
    //   model: {
    //     name: 'Video Camera',
    //     // Non-Pi Cam
    //     source: 'videocap://1',
    //     // Pi Cam
    //     // source: 'mmal service 16.1',
    //   },
    // },
  ],
  plugins: [
    // TODO: move general settings to @tegapp/core plugin settings
    {
      id: '1',
      modelVersion: 1,
      package: '@tegapp/core',
      model: {
        machineDefinitionURL: 'dat://a295acba915cf57a98854f9f4ecf4be0aa03342a1b814bed591592b611f87e66+preview/definitions/alfawise_u20.def.json',
        name: 'New Printer',
        automaticPrinting: false,
        beforePrintHook: '',
        afterPrintHook: '',
        swapXAndYOrientation: false,
        macros: [
          '*',
        ],
      },
    },
    {
      id: '2',
      modelVersion: 1,
      package: '@tegapp/marlin',
      model: {
        macros: [
          '*',
        ],
      },
    },
    {
      id: '3',
      modelVersion: 1,
      package: '@tegapp/macros-default',
      model: {
        macros: [
          '*',
        ],
      },
    },
  ],
}

// // Only add the raspberry pi plugin when running on an ARM CPU
// if (['arm', 'arm64'].includes(os.arch())) {
//   printerConfig.plugins.push({
//     id: 'aa00bb33',
//     modelVersion: 1,
//     package: '@tegapp/raspberry-pi',
//     model: {
//       outputPins: [
//         7,
//       ],
//       macros: [
//         '*',
//       ],
//     },
//   })
// }

const hostConfig = {
  id: 'pzxcvkkwn',
  localID: 4,
  name: 'New Print Farm',
  modelVersion: 1,
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
    directory: '/run/log/teg',
    uploadCrashReportsToDevs: true,
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
  modelVersion: 1,
  printer: printerConfig,
  host: hostConfig,
  auth: authConfig,
  materials,
}

module.exports = config
