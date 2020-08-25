import {
  CONTROLLER,
  AXIS,
  TOOLHEAD,
  BUILD_PLATFORM,
  FAN,
  VIDEO,
} from './config/types/components/ComponentTypeEnum'

const getCorePluginConfigPath = (printerConfig) => {
  const index = printerConfig.plugins.findIndex(c => c.package === '@tegapp/core')
  return ['plugins', index]
}

const componentBaseProperties = schema => ({
  ...(schema.properties || {}),
  name: {
    title: 'Name',
    type: 'string',
    minLength: 1,
  },
})

const getSchemaForms = () => ({
  machine: {
    schema: schema => ({
      ...schema,
      type: 'object',
      title: 'Basic Printer Settings',
      required: [
        ...(schema.required || []),
        // 'machineDefinitionURL',
        'name',
      ],
      properties: {
        ...(schema.properties || {}),
        // machineDefinitionURL: {
        //   title: 'Printer make and model DAT',
        //   type: 'string',
        // },
        name: {
          title: 'Printer Name',
          type: 'string',
          minLength: 1,
        },
        automaticPrinting: {
          title: 'Automatic Printing',
          desciption: (
            'Start prints automatically without human interaction.'
            + ' Requires automation hardware such as an auto-scraper or'
            + ' conveyor.'
          ),
          type: 'boolean',
          default: false,
        },
        swapXAndYOrientation: {
          title: 'Swap visual orientation of X and Y axes',
          type: 'boolean',
          default: false,
        },
        beforePrintHook: {
          title: 'Before Print (GCode)',
          type: 'string',
          default: '',
        },
        afterPrintHook: {
          title: 'After Print (GCode)',
          type: 'string',
          default: '',
        },
      },
    }),
    form: [
      // 'machineDefinitionURL',
      'name',
    ],
    configPaths: configPaths => ({
      ...configPaths,
      // machineDefinitionURL: getCorePluginConfigPath,
      name: getCorePluginConfigPath,
      automaticPrinting: getCorePluginConfigPath,
      beforePrintHook: getCorePluginConfigPath,
      afterPrintHook: getCorePluginConfigPath,
      swapXAndYOrientation: getCorePluginConfigPath,
    }),
  },
  auth: {
    user: {
      schema: schema => ({
        ...schema,
        type: 'object',
        title: 'User',
        required: [
          ...(schema.required || []),
          'isAdmin',
        ],
        properties: {
          ...(schema.properties || {}),
          name: {
            title: 'Name',
            type: 'string',
            readOnly: true,
          },
          email: {
            title: 'Email',
            type: 'string',
            readOnly: true,
          },
          emailVerified: {
            title: 'Email Verified',
            type: 'boolean',
            readOnly: true,
          },
          isAdmin: {
            title: 'Admin',
            type: 'boolean',
            default: false,
          },
        },
      }),
      form: [
        'name',
        'email',
        'emailVerified',
        'isAdmin',
      ],
    },
    invite: {
      schema: schema => ({
        ...schema,
        type: 'object',
        title: 'User',
        required: [
          ...(schema.required || []),
          'isAdmin',
        ],
        properties: {
          ...(schema.properties || {}),
          // createdAt: {
          //   title: 'Created At',
          //   type: 'string',
          //   readOnly: true,
          // },
          isAdmin: {
            title: 'Admin Access Invite',
            type: 'boolean',
            default: false,
          },
        },
      }),
      form: [
        // 'createdAt',
        'isAdmin',
      ],
    },
  },
  plugins: {
    '@tegapp/core': {
      schema: schema => ({
        ...schema,
        type: 'object',
        title: '@tegapp/core',
        required: [
          ...(schema.required || []),
          'name',
          'automaticPrinting',
        ],
        properties: {
          ...(schema.properties || {}),
        },
      }),
      form: [
        'name',
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
            default: false,
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
          simulate: {
            title: 'Simulate Attached Controller',
            type: 'boolean',
            default: false,
          },
        },
      }),
      form: [
        'name',
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
    [VIDEO]: {
      schema: schema => ({
        ...schema,
        type: 'object',
        title: 'Video',
        required: [
          ...(schema.required || []),
          'name',
          'source',
        ],
        properties: {
          ...componentBaseProperties(schema),
          name: {
            title: 'Name',
            type: 'string',
            minLength: 1,
          },
          source: {
            title: 'Source',
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
            description: ''
              + 'The extrude/retract speed for the maintenance panel '
              + 'as well as the extrude speed for filament swaps.',
          },
          materialID: {
            title: 'Material',
            type: 'string',
            minLength: 1,
          },
          filamentSwapExtrudeDistance: {
            title: 'Filament Swap Test Extrude (mm)',
            description: ''
              + 'Extrudes a small amount of filament to prime the extruder after a filament swap. '
              + 'Also retracts the filament by this same amount when removing filament.',
            type: 'number',
            default: 100,
          },
          heater: {
            title: 'Heated Extruder',
            type: 'boolean',
            default: false,
          },
          filamentSwapFastMoveEnabled: {
            title: 'Fast Bowden Tube Priming',
            description: ''
              + 'Adds an extruder movement before the test extrude to quickly move the filament '
              + 'from the cold end to the hot end.',
            type: 'boolean',
            default: false,
          },
          bowdenTubeLength: {
            title: 'Bowden Tube Length (mm)',
            type: 'number',
            default: 0,
          },
          filamentSwapFastMoveSpeed: {
            title: 'Bowden Tube Priming Speed (mm/s)',
            description: ''
              + 'This should be the maximum non-extruding speed that you can move filament '
              + 'through the bowden cable.',
            type: 'number',
            default: 200,
          },
          beforeFilamentSwapHook: {
            title: 'Before Filament Swap (GCode)',
            type: 'string',
            default: '',
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
