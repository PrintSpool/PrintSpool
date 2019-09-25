/*
 * example use: { noOp: { } }
 */
const compileNoOp = () => ({})

const noOpMacro = {
  key: 'noOp',
  schema: {
    type: 'object',
  },
  compile: compileNoOp,
}

export default noOpMacro
