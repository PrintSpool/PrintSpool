import {
  CONTROLLER,
  AXIS,
  TOOLHEAD,
  BUILD_PLATFORM,
  FAN,
} from './config/types/components/ComponentTypeEnum'

const getSchemaForms = () => ({
  'tegh-core': {
    schema: schema => ({
      ...schema,
      type: 'object',
      required: [
        ...(schema.required || []),
        'name',
        'modelID',
      ],
      title: '3D Printer',
      properties: {
        ...(schema.properties || {}),
        name: {
          title: 'Name',
          type: 'string',
        },
        modelID: {
          title: 'Make and model',
          type: 'string',
          enum: [
            'lulzbot/lulzbot-mini-1',
            'lulzbot/lulzbot-mini-2',
          ],
          enumNames: [
            'Lulzbot Mini 1',
            'Lulzbot Mini 2',
          ],
        },
      },
    }),
  },
  [CONTROLLER]: {
    schema: schema => ({
      ...schema,
      type: 'object',
      title: 'Comment',
      properties: {
        ...(schema.properties || {}),
        name: {
          title: 'Name',
          type: 'string',
          default: 'Steve',
        },
      },
    }),
  },
})

export default getSchemaForms
