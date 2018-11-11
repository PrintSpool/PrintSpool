/* eslint-disable quote-props, quotes, comma-dangle */
const config = {
  "id": "aaxcvxcvcxv-bvb-csdf234231",
  "printerID": 'abb321x',
  "modelID": "lulzbot/lulzbot-mini-2",

  "name": "Left Home Lulzbot",
  "axes": [
    {
      "id": "x111",
      "name": "X",
      "feedrate": 150
    },
    {
      "id": "y111",
      "name": "Y",
      "feedrate": 150
    },
    {
      "id": "z111",
      "name": "Z",
      "feedrate": 4
    }
  ],
  "components": [
    {
      "id": "bbbserialController",
      "type": "CONTROLLER",
      "interface": "SERIAL",
      "name": "RAMPS Controller Board",
      "serialPortID": "/dev/serial/by-id/usb-Arduino__www.arduino.cc__Arduino_Mega_2560_749373037363518101E2-if00",
      "baudRate": 250000,
      "simulate": true
    },
    {
      "id": "aaa2qe0",
      "type": "TOOLHEAD",
      "name": "Extruder 1",
      "heater": true,
      "feedrate": 3,
      "materialID": "generic/pla"
    },
    {
      "id": "abvwee1",
      "type": "TOOLHEAD",
      "name": "Extruder 2",
      "heater": true,
      "feedrate": 3,
      "materialID": "generic/abs"
    },
    {
      "id": "bdfbxb",
      "type": "BUILD_PLATFORM",
      "name": "Bed",
      "heater": true
    },
    {
      "id": "ndrgrwef",
      "type": "FAN",
      "name": "Extruder Fan"
    },
  ],
  "plugins": [
    {
      "id": 'aaabbbccc123',
      "package": "tegh-macros-default",
      "macros": [
        "*"
      ]
    },
    {
      "id": 'aaabbbccc333',
      "package": "tegh-driver-serial-gcode",
      "settings": {
        "responseTimeoutTickleAttempts": 3,
        "fastCodeTimeout": 30000,
        "longRunningCodeTimeout": 60000,
        "temperaturePollingInterval": 1000,
        "delayFromGreetingToReady": 2500,
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
      }
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

export const hostConfig = {
  "id": "pzxcvkkwn",
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
/* eslint-enable */

export default config
