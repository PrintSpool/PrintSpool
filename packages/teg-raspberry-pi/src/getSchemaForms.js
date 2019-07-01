const getSchemaForms = () => ({
  plugins: {
    '@tegapp/raspberry-pi': {
      schema: schema => ({
        ...schema,
        type: 'object',
        title: '@tegapp/raspberry-pi',
        required: [
          ...(schema.required || []),
          'outputPins',
        ],
        properties: {
          ...(schema.properties || {}),
          outputPins: {
            title: 'Output GPIO Pins',
            type: 'array',
            items: {
              type: 'integer',
            },
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
