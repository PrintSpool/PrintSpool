const getSchemaForms = () => ({
  plugins: {
    '@tegh/autodrop3d': {
      schema: schema => ({
        ...schema,
        type: 'object',
        title: '@tegh/autodrop3d',
        required: [
          ...(schema.required || []),
          'outputPins',
        ],
        properties: {
          ...(schema.properties || {}),
          deviceID: {
            title: 'AutoDrop Device ID',
            type: 'string',
          },
          apiURL: {
            title: '[ADVANCED] API URL',
            type: 'string',
          },
        },
      }),
      form: [
        'outputPins',
      ],
    },
  },
})

export default getSchemaForms
