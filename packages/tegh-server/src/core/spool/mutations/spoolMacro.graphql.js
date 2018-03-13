import tql from 'typiql'
import GraphQLJSON from 'graphql-type-json'

import FileInputType from '../../util/FileInput.graphql.js'
import actionResolver from '../../util/actionResolver'
import spoolMacro from './spoolMacro'

const spoolMacroGraphQL = () => ({
  type: tql`${TaskType}!`,
  description: snl`
    Spools a task to execute a macro.
  `
  resolve: actionResolver({
    actionCreator: spoolMacro,
  }),

  args: {
    printerID: {
      type: tql`ID!`,
    },
    macro: {
      type: tql`String`,
      description: snl`The name of the macro`,
    },
    args: {
      type: tql`${GraphQLJSON}`,
      description: snl`The args to pass to the macro`,
    },
  },
})

export default spoolMacroGraphQL
