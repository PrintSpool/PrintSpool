import tql from 'typiql'
import snl from 'strip-newlines'
import { GraphQLInputObjectType } from 'graphql'
import GraphQLJSON from 'graphql-type-json'

import FileInputType from '../../util/FileInput.graphql.js'
import actionResolver from '../../util/actionResolver'
import spoolMacro from '../actions/spoolMacro'
import getTask from '../selectors/getTask'

import TaskGraphQL from '../types/Task.graphql.js'

const SpoolMacroInputGraphQL = new GraphQLInputObjectType({
  name: 'SpoolMacroInput',
  fields: {
    printerID: {
      type: tql`ID!`,
    },
    macro: {
      type: tql`String!`,
      description: snl`The name of the macro`,
    },
    args: {
      type: tql`${GraphQLJSON}`,
      description: snl`The args to pass to the macro`,
    },
  },
})

const spoolMacroGraphQL = () => ({
  type: tql`${TaskGraphQL}!`,
  description: snl`
    Spools a task to execute a macro.
  `,
  resolve: actionResolver({
    actionCreator: spoolMacro,
    selector: (state, action) => action.payload.task,
  }),

  args: {
    input: {
      type: tql`${SpoolMacroInputGraphQL}!`,
    },
  },
})

export default spoolMacroGraphQL
