// example useage: { toggleMotorsEnabled: { enable: true } }
const compileToggleMotorsEnabled = ({
  args: { enable },
}) => ({
  commands: [enable ? 'M17' : 'M18'],
})

const toggleMotorsEnabledMacro = {
  key: 'toggleMotorsEnabled',
  schema: {
    type: 'object',
    properties: {
      enabled: {
        type: 'boolean',
      },
    },
  },
  compile: compileToggleMotorsEnabled,
}

export default toggleMotorsEnabledMacro
