/* eslint-disable quote-props, quotes, comma-dangle */
const config = {
  "id": "aaxcvxcvcxv-bvb-csdf234231",
  "name": "Left Home Lulzbot",
  "makeAndModel": "lulzbot/lulzbot-mini-2",
  "machine": {
    "axes": {
      "x": {
        "feedrate": 150
      },
      "y": {
        "feedrate": 150
      },
      "z": {
        "feedrate": 4
      }
    },
    "components": {
      "serialController": {
        "type": "SERIAL_CONTROLLER",
        "name": "Serial Controller Board",
        "portID": "/dev/serial/by-id/usb-Arduino__www.arduino.cc__Arduino_Mega_2560_749373037363518101E2-if00",
        "baudRate": 250000,
        "simulation": false
      },
      "e0": {
        "type": "EXTRUDER",
        "name": "Extruder 1",
        "feedrate": 3,
        "materialID": "example/pla"
      },
      "e1": {
        "type": "EXTRUDER",
        "name": "Extruder 2",
        "feedrate": 3,
        "materialID": "example/abs"
      },
      "b": {
        "type": "HEATED_BED",
        "name": "Bed"
      },
      "f": {
        "type": "FAN",
        "name": "Extruder Fan"
      }
    }
  },
  "materials": {
    "example/pla": {
      "targetTemperature": 220,
      "targetBedTemperature": 60
    },
    "example/abs": {
      "targetTemperature": 200,
      "targetBedTemperature": 60
    }
  },
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
