import {
  CONTROLLER,
  AXIS,
  TOOLHEAD,
  BUILD_PLATFORM,
  FAN,
} from './config/types/components/ComponentTypeEnum'

const componentBaseProperties = schema => ({
  ...(schema.properties || {}),
  name: {
    title: 'Name',
    type: 'string',
    minLength: 1,
  },
})

const getSchemaForms = () => ({
  plugins: {
    '@tegh/core': {
      schema: schema => ({
        ...schema,
        type: 'object',
        title: '@tegh/core',
        required: [
          ...(schema.required || []),
          'name',
          'modelID',
          'automaticPrinting'
        ],
        properties: {
          ...(schema.properties || {}),
          name: {
            title: 'Name',
            type: 'string',
            minLength: 1,
          },
          // modelID: {
          //   title: 'Make and model',
          //   type: 'string',
          //   enum: [
          //     'lulzbot/lulzbot-mini-1',
          //     'lulzbot/lulzbot-mini-2',
          //   ],
          //   enumNames: [
          //     'Lulzbot Mini 1',
          //     'Lulzbot Mini 2',
          //   ],
          // },
          automaticPrinting: {
            title: 'Automatic Printing',
            desciption: (
              'Start prints automatically without human interaction.'
              + ' Requires automation hardware such as an auto-scraper or'
              + ' conveyor.'
            ),
            type: 'boolean',
          },
          beforePrintHook: {
            title: 'Before Print Hook (Extended GCode)',
            type: 'string',
          },
          afterPrintHook: {
            title: 'After Print Hook (Extended GCode)',
            type: 'string',
          },
        },
      }),
      form: [
        'name',
        // 'modelID',
        'automaticPrinting',
      ],
    },
  },
  materials: {
    FDM_FILAMENT: {
      schema: schema => ({
        ...schema,
        type: 'object',
        title: 'FDM Filament',
        required: [
          ...(schema.required || []),
          'targetExtruderTemperature',
          'targetBedTemperature',
        ],
        properties: {
          ...(schema.properties || {}),
          name: {
            title: 'Name',
            type: 'string',
            minLength: 1,
          },
          targetExtruderTemperature: {
            title: 'Target Extruder Temperature',
            type: 'number',
          },
          targetBedTemperature: {
            title: 'Target Bed Temperature',
            type: 'number',
          },
        },
      }),
      form: [
        'targetExtruderTemperature',
        'targetBedTemperature',
      ],
    },
  },
  components: {
    [AXIS]: {
      schema: schema => ({
        ...schema,
        type: 'object',
        title: 'Axis',
        required: [
          ...(schema.required || []),
          'name',
          'address',
          'feedrate',
        ],
        properties: {
          ...componentBaseProperties(schema),
          address: {
            title: 'GCode Address',
            type: 'string',
            minLength: 1,
          },
          feedrate: {
            title: 'Feedrate (mm/s)',
            type: 'number',
          },
        },
      }),
      form: [
        'name',
        'address',
        'feedrate',
      ],
    },
    [BUILD_PLATFORM]: {
      schema: schema => ({
        ...schema,
        type: 'object',
        title: 'Build Platform',
        required: [
          ...(schema.required || []),
          'name',
          'address',
          'heater',
        ],
        properties: {
          ...componentBaseProperties(schema),
          address: {
            title: 'GCode Address',
            type: 'string',
            minLength: 1,
          },
          heater: {
            title: 'Heated Build Platform',
            type: 'boolean',
          },
        },
      }),
      form: [
        'name',
        'address',
        'heater',
      ],
    },
    [CONTROLLER]: {
      schema: schema => ({
        ...schema,
        type: 'object',
        title: 'Controller',
        required: [
          ...(schema.required || []),
          'name',
          'serialPortID',
          'baudRate',
          'simulate',
        ],
        properties: {
          ...componentBaseProperties(schema),
          serialPortID: {
            title: 'Serial Port',
            type: 'string',
            minLength: 1,
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
          simulate: {
            title: 'Simulate Attached Controller',
            type: 'boolean',
          },
        },
      }),
      form: [
        'name',
        'serialPortID',
        'baudRate',
        'simulate',
      ],
    },
    [FAN]: {
      schema: schema => ({
        ...schema,
        type: 'object',
        title: 'Fan',
        required: [
          ...(schema.required || []),
          'name',
          'address',
        ],
        properties: {
          ...componentBaseProperties(schema),
          address: {
            title: 'GCode Address',
            type: 'string',
            minLength: 1,
          },
        },
      }),
      form: [
        'name',
        'address',
      ],
    },
    [TOOLHEAD]: {
      schema: schema => ({
        ...schema,
        type: 'object',
        title: 'Fan',
        required: [
          ...(schema.required || []),
          'name',
          'address',
          'feedrate',
          'materialID',
          'heater',
        ],
        properties: {
          ...componentBaseProperties(schema),
          address: {
            title: 'GCode Address',
            type: 'string',
            minLength: 1,
          },
          feedrate: {
            title: 'Feedrate (mm/s)',
            type: 'number',
          },
          materialID: {
            title: 'Material',
            type: 'string',
            minLength: 1,
          },
          heater: {
            title: 'Heated Extruder',
            type: 'boolean',
          },
        },
      }),
      form: [
        'name',
        'address',
        'feedrate',
        'materialID',
        'heater',
      ],
    },
  },
})

export default getSchemaForms
