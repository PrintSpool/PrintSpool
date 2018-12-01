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
  },
})

const getSchemaForms = () => ({
  'tegh-core': {
    schema: schema => ({
      ...schema,
      type: 'object',
      title: 'tegh-core',
      required: [
        ...(schema.required || []),
        'name',
        'modelID',
      ],
      properties: {
        ...(schema.properties || {}),
        name: {
          title: 'Name',
          type: 'string',
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
      },
    }),
    form: [
      'name',
      // 'modelID',
    ],
  },
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
  [AXIS]: {
    schema: schema => ({
      ...schema,
      type: 'object',
      title: 'Axis',
      properties: {
        ...componentBaseProperties(schema),
        name: {
          title: 'Name',
          type: 'string',
        },
        feedrate: {
          title: 'Feedrate',
          type: 'number',
        },
      },
    }),
    form: [
      'name',
      'heater',
    ],
  },  [BUILD_PLATFORM]: {
    schema: schema => ({
      ...schema,
      type: 'object',
      title: 'Build Platform',
      properties: {
        ...componentBaseProperties(schema),
        heater: {
          title: 'Heated Build Platform',
          type: 'boolean',
        },
      },
    }),
    form: [
      'name',
      'heater',
    ],
  },
  [CONTROLLER]: {
    schema: schema => ({
      ...schema,
      type: 'object',
      title: 'Controller',
      properties: {
        ...componentBaseProperties(schema),
        serialPortID: {
          title: 'Serial Port',
          type: 'string',
          // TODO: serial port dynamic enum
          enum: [
            'Arduino_1',
            'Arduino_2',
          ],
        },
        baudRate: {
          title: 'Baud Rate',
          type: 'integer',
          enum: [
            9200,
            250000,
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
      properties: {
        ...componentBaseProperties(schema),
      },
    }),
    form: [
      'name',
    ],
  },
  [TOOLHEAD]: {
    schema: schema => ({
      ...schema,
      type: 'object',
      title: 'Fan',
      properties: {
        ...componentBaseProperties(schema),
        feedrate: {
          title: 'Feedrate',
          type: 'number',
        },
        materialID: {
          title: 'Material',
          type: 'enum',
          enum: [
            'generic/abs',
            'generic/pla',
          ],
        },
        heater: {
          title: 'Heated Extruder',
          type: 'boolean',
        },
      },
    }),
    form: [
      'name',
      'feedrate',
      'materialID',
      'heater',
    ],
  },

})

export default getSchemaForms
