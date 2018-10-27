/* eslint-disable quote-props, quotes, comma-dangle */
const config = {
  "id": "aaxcvxcvcxv-bvb-csdf234231",
  "name": "Left Home Lulzbot",
  "makeAndModel": "lulzbot/lulzbot-mini-2",
  "machine": {
    "axes": [
      {
        "id": "x",
        "feedrate": 150
      },
      {
        "id": "y",
        "feedrate": 150
      },
      {
        "id": "z",
        "feedrate": 4
      }
    ],
    "components": [
      {
        "id": "serialController",
        "type": "SERIAL_CONTROLLER",
        "name": "Serial Controller Board",
        "portID": "/dev/serial/by-id/usb-Arduino__www.arduino.cc__Arduino_Mega_2560_749373037363518101E2-if00",
        "baudRate": 250000,
        "simulation": false
      },
      {
        "id": "e0",
        "type": "TOOLHEAD",
        "name": "Extruder 1",
        "heater": true,
        "feedrate": 3,
        "materialID": "example/pla"
      },
      {
        "id": "e1",
        "type": "TOOLHEAD",
        "name": "Extruder 2",
        "heater": true,
        "feedrate": 3,
        "materialID": "example/abs"
      },
      {
        "id": "b",
        "type": "BUILD_PLATFORM",
        "name": "Bed",
        "heater": true
      },
      {
        "id": "f",
        "type": "FAN",
        "name": "Extruder Fan"
      },
    ]
  },
  "materials": [
    {
      "id": "example/pla",
      "targetTemperature": 220,
      "targetBedTemperature": 60
    },
    {
      "id": "example/abs",
      "targetTemperature": 200,
      "targetBedTemperature": 60
    }
  ],
  "plugins": {
    "tegh-macros-default": {
      "macros": [
        "*"
      ]
    },
    "tegh-driver-serial-gcode": {}
  },
  "log": {
    "maxLength": 1000,
    "stderr": [
      "info",
      "warning",
      "error",
      "fatal"
    ]
  },
  "crashReports": {
    "directory": "/var/log/tegh",
    "uploadCrashReportsToDevs": true
  },
  "server": {
    "signallingServer": "ws://localhost:3000",
    "keys": "~/.tegh/dev.development.keys.json",
    "webRTC": true,
    "tcpPort": 3901
  }
}
/* eslint-enable */

export default config
