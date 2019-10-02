import { ComponentTypeEnum } from '@tegapp/core'

const { CONTROLLER } = ComponentTypeEnum

const getControllerConfigPath = (printerConfig) => {
  const index = printerConfig.components.findIndex(c => c.type === CONTROLLER)
  return ['components', index]
}

const getSchemaForms = () => ({
  machine: {
    schema: schema => ({
      ...schema,
      required: [
        ...(schema.required || []),
        'serialPortID',
        'baudRate',
      ],
      properties: {
        ...(schema.properties || {}),
        serialPortID: {
          title: 'Serial Port',
          type: 'string',
          minLength: 1,
        },
        automaticBaudRateDetection: {
          title: 'Automatic Baud Rate Detection',
          type: 'boolean',
        },
        baudRate: {
          title: 'Baud Rate',
          type: 'integer',
          enum: [
            250000,
            230400,
            115200,
            57600,
            38400,
            19200,
            9600,
          ],
        },
      },
    }),
    form: [
      'serialPortID',
      'automaticBaudRateDetection',
      'baudRate',
    ],
    configPaths: configPaths => ({
      ...configPaths,
      baudRate: getControllerConfigPath,
      serialPortID: getControllerConfigPath,
    }),
  },
  components: {
    [CONTROLLER]: {
      schema: schema => ({
        ...schema,
        properties: {
          ...(schema.properties || {}),
          awaitGreetingFromFirmware: {
            title: 'Await greeting from firmware',
            type: 'boolean',
            default: true,
          },
          checksumTickles: {
            title: 'Send checksums with response timeout tickle attempts',
            type: 'boolean',
            default: true,
          },
          responseBufferSize: {
            title: 'Number of GCode responses to keep buffered on the machine service',
            type: 'integer',
            default: 10,
          },
          delayFromGreetingToReady: {
            title: 'Delay from greeting to ready (ms)',
            type: 'integer',
            default: 2500,
          },
          pollingInterval: {
            title: 'Temperature polling interval (ms)',
            type: 'integer',
            default: 1000,
          },
          positionPollingInterval: {
            title: 'Position polling interval (ms)',
            type: 'integer',
            default: 500,
          },
          responseTimeoutTickleAttempts: {
            title: 'Response timeout tickle attempts',
            type: 'integer',
            default: 3,
          },
          fastCodeTimeout: {
            title: 'Fast code timeout (ms)',
            type: 'integer',
            default: 30000,
          },
          longRunningCodeTimeout: {
            title: 'Long running code timeout (ms)',
            type: 'integer',
            default: 60000,
          },
          // longRunningCodes: {
          //   title: 'Long running code timeout',
          //   type: 'array',
          //   uniqueItems: true,
          //   items: {
          //     type: 'string',
          //   },
          //   default: [
          //     'G4',
          //     'G28',
          //     'G29',
          //     'G30',
          //     'G32',
          //     'M226',
          //     'M400',
          //     'M600',
          //   ],
          // },
        },
      }),
      form: [
        'awaitGreetingFromFirmware',
        'delayFromGreetingToReady',
        'pollingInterval',
        'responseTimeoutTickleAttempts',
        'fastCodeTimeout',
        'longRunningCodeTimeout',
        // 'longRunningCodes',
        // 'checksumTickles'
      ],
    },
  },
})

export default getSchemaForms
