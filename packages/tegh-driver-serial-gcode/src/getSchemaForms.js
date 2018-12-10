import { ComponentTypeEnum } from 'tegh-core'

const { CONTROLLER } = ComponentTypeEnum

const getSchemaForms = () => ({
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
          delayFromGreetingToReady: {
            title: 'Delay from greeting to ready (ms)',
            type: 'integer',
            default: 2500,
          },
          temperaturePollingInterval: {
            title: 'Temperature polling interval (ms)',
            type: 'integer',
            default: 1000,
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
        'temperaturePollingInterval',
        'responseTimeoutTickleAttempts',
        'fastCodeTimeout',
        'longRunningCodeTimeout',
        // 'longRunningCodes',
      ],
    },
  },
})

export default getSchemaForms
