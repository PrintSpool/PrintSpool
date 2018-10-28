/* eslint-disable quote-props, quotes, comma-dangle */
const config = {
  "id": "aaxcvxcvcxv-bvb-csdf234231",
  "name": "Left Home Lulzbot",
  "modelID": "lulzbot/lulzbot-mini-2",
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
      "id": "serialController",
      "type": "CONTROLLER",
      "interface": "SERIAL",
      "name": "RAMPS Controller Board",
      "serialPortID": "/dev/serial/by-id/usb-Arduino__www.arduino.cc__Arduino_Mega_2560_749373037363518101E2-if00",
      "baudRate": 250000,
      "simulate": true
    },
    {
      "id": "e0",
      "type": "TOOLHEAD",
      "name": "Extruder 1",
      "heater": true,
      "feedrate": 3,
      "materialID": "generic/pla"
    },
    {
      "id": "e1",
      "type": "TOOLHEAD",
      "name": "Extruder 2",
      "heater": true,
      "feedrate": 3,
      "materialID": "generic/abs"
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
  ],
  "plugins": [
    {
      "id": "tegh-macros-default",
      "macros": [
        "*"
      ]
    },
    {
      "id": "tegh-driver-serial-gcode",
    },
  ],
  "log": {
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
