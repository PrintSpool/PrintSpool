import {
  CONTROLLER,
  AXIS,
  TOOLHEAD,
  BUILD_PLATFORM,
  FAN,
} from './config/types/components/ComponentTypeEnum'

const getSchemaForms = () => ({
  [CONTROLLER]: {
    schema: schema => ({
      ...schema,
      "type": "object",
      "title": "Comment",
      "properties": {
        ...schema.properties,
        "name": {
          "title": "Name",
          "type": "string",
          "default": "Steve"
        },
      },
    }),
  },
})

export default getSchemaForms
