const simulate = false
const useKlipper = true

let serialPortID
let baudRate

if (simulate === true) {
  serialPortID = '/dev/nonExistantSerialPort'
  baudRate = 250000
} else if (useKlipper) {
  // Klipper (requires the klipper host software to be running)
  serialPortID = '/tmp/printer'
  baudRate = 250000
} else {
  // Marlin
  serialPortID = '/dev/serial/by-id/usb-Arduino__www.arduino.cc__Arduino_Mega_2560_749373037363518101E2-if00'
  baudRate = 250000
}

/* eslint-disable quote-props, quotes, comma-dangle */
const printerConfig = {
  "id": "aaxcvxcvcxv-bvb-csdf234231",
  "printerID": 'abb321x',
  "modelID": "lulzbot/lulzbot-mini-2",

  "name": "Left Home Lulzbot",
  "components": [
    {
      // Controller must be the first component for driver test mocks
      "id": "bbbserialController",
      "type": "CONTROLLER",
      "interface": "SERIAL",
      "name": "RAMPS Controller Board",
      "serialPortID": serialPortID,
      "baudRate": baudRate,
      "simulate": simulate,
      "extendedConfig": {
        "delayFromGreetingToReady": 2500,
        "temperaturePollingInterval": 1000,
        "responseTimeoutTickleAttempts": 3,
        "fastCodeTimeout": 30000,
        "longRunningCodeTimeout": 60000,
        awaitGreetingFromFirmware: useKlipper === false,
        "longRunningCodes": [
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
    {
      "id": "x111",
      "type": "AXIS",
      "address": "x",
      "name": "X",
      "feedrate": 150
    },
    {
      "id": "y111",
      "type": "AXIS",
      "address": "y",
      "name": "Y",
      "feedrate": 150
    },
    {
      "id": "z111",
      "type": "AXIS",
      "address": "z",
      "name": "Z",
      "feedrate": 4
    },
    {
      "id": "aaa2qe0",
      "address": "e0",
      "type": "TOOLHEAD",
      "name": "Extruder 1",
      "heater": true,
      "feedrate": 3,
      "materialID": "generic/pla"
    },
    {
      "id": "abvwee1",
      "address": "e1",
      "type": "TOOLHEAD",
      "name": "Extruder 2",
      "heater": true,
      "feedrate": 3,
      "materialID": "generic/abs"
    },
    {
      "id": "ndrgrwef",
      "address": "f0",
      "type": "FAN",
      "name": "Hot End Fan"
    },
    {
      "id": "ndrgrwef",
      "address": "f1",
      "type": "FAN",
      "name": "Print Fan"
    },
    {
      "id": "bdfbxb",
      "address": "b",
      "type": "BUILD_PLATFORM",
      "name": "Bed",
      "heater": true
    },
  ],
  "plugins": [
    {
      "id": 'aaabbbccc333',
      "package": "tegh-driver-serial-gcode",
    },
    {
      "id": 'aaabbbccc123',
      "package": "tegh-macros-default",
      "macros": [
        "*"
      ]
    },
  ],
  "log": {
    "id": "bdfgkljwe",
    "maxLength": 1000,
    "stderr": [
      "info",
      "warning",
      "error",
      "fatal"
    ]
  },
}

const hostConfig = {
  "id": "pzxcvkkwn",
  "name": "ExampleLabs FabLab",
  "crashReports": {
    "id": "bfdbdffeews",
    "directory": "/var/log/tegh",
    "uploadCrashReportsToDevs": true
  },
  "server": {
    "id": "vcxbksdkewj",
    "signallingServer": "ws://localhost:3000",
    "keys": "~/.tegh/dev.development.keys.json",
    "webRTC": true,
    "tcpPort": 3901
  }
}

const materials = [
  {
    "id": "generic/pla",
    "targetExtruderTemperature": 220,
    "targetBedTemperature": 60
  },
  {
    "id": "generic/abs",
    "targetExtruderTemperature": 200,
    "targetBedTemperature": 60
  },
]
/* eslint-enable */

const config = {
  printer: printerConfig,
  host: hostConfig,
  materials,
}

module.exports = config
