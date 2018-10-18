import tql from 'typiql'
import snl from 'strip-newlines'
import { GraphQLInputObjectType } from 'graphql'
import GraphQLJSON from 'graphql-type-json'

import actionResolver from '../../util/actionResolver'
import spoolMacro from '../actions/spoolMacro'

import TaskGraphQL from '../types/Task.graphql'

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
  type: tql`Boolean`,
  description: snl`
    Spools a task to execute a macro.
  `,
  resolve: actionResolver({
    actionCreator: spoolMacro,
    selector: () => null,
  }),

  args: {
    input: {
      type: tql`${SpoolMacroInputGraphQL}!`,
    },
  },
})

export default spoolMacroGraphQL
