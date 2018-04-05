import tql from 'typiql'
import snl from 'strip-newlines'
import { GraphQLInputObjectType } from 'graphql'
import GraphQLJSON from 'graphql-type-json'

import actionResolver from '../../util/actionResolver'
import cancelTask from '../actions/cancelTask'
import getTask from '../selectors/getTask'

import TaskGraphQL from '../types/Task.graphql.js'

const CancelTaskInputGraphQL = new GraphQLInputObjectType({
  name: 'CancelTaskInput',
  fields: {
    printerID: {
      type: tql`ID!`,
    },
    taskID: {
      type: tql`ID!`,
    },
  },
})

const cancelTaskGraphQL = () => ({
  type: tql`${TaskGraphQL}!`,
  description: snl`
    Spools a task to execute a macro.
  `,
  resolve: actionResolver({
    actionCreator: cancelTask,
    selector: (state, action) => getTask(state)(action.payload.id),
  }),

  args: {
    input: {
      type: tql`${CancelTaskInputGraphQL}!`
    },
  },
})

export default cancelTaskGraphQL
