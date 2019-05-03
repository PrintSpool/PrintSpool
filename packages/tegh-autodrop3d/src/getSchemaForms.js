const getSchemaForms = () => ({
  plugins: {
    '@tegh/autodrop3d': {
      schema: schema => ({
        ...schema,
        type: 'object',
        title: '@tegh/autodrop3d',
        required: [
          ...(schema.required || []),
          'deviceID',
        ],
        properties: {
          ...(schema.properties || {}),
          deviceID: {
            title: 'AutoDrop Device ID',
            type: 'string',
          },
          // TODO: AutoDrop expects to add a required deviceKey param in the
          // future.
          // deviceKey: {
          //   title: 'AutoDrop Device Secret Key',
          //   type: 'string',
          // },
          automaticJobDownload: {
            title: 'Automatically download jobs',
            type: 'boolean',
          },
          // TODO: hide advanced settings by default somehow
          // apiURL: {
          //   title: '[ADVANCED] API URL',
          //   type: 'string',
          // },
        },
      }),
      form: [
        'outputPins',
      ],
    },
  },
})

export default getSchemaForms
