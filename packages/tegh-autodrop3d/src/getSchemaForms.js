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
          deviceKey: {
            title: 'AutoDrop Device Secret Key',
            type: 'string',
          },
          automaticJobDownload: {
            title: 'Automatically download jobs',
            type: 'boolean',
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
