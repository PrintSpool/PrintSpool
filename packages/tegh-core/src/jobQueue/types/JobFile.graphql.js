import tql from 'typiql'
import {
  GraphQLObjectType,
} from 'graphql'
import { List } from 'immutable'

import getTasksByTaskableID from '../../spool/selectors/getTasksByTaskableID'
import getPrintsCompletedByJobFileID from '../selectors/getPrintsCompletedByJobFileID'
import getTotalPrintsByJobFileID from '../selectors/getTotalPrintsByJobFileID'
import getIsDoneByJobFileID from '../selectors/getIsDoneByJobFileID'

import TaskGraphQL from '../../spool/types/Task.graphql'

const JobFileGraphQL = new GraphQLObjectType({
  name: 'JobFile',
  fields: () => ({
    id: {
      type: tql`ID!`,
    },
    name: {
      type: tql`String!`,
    },
    quantity: {
      type: tql`Int!`,
    },
    tasks: {
      type: tql`[${TaskGraphQL}]!`,
      resolve(source, args, { store }) {
        const state = store.getState().spool
        const tasks = getTasksByTaskableID(state).get(source.id, List())

        return tasks
      },
    },
    printsCompleted: {
      type: tql`Int!`,
      resolve(source, args, { store }) {
        const state = store.getState().jobQueue
        return getPrintsCompletedByJobFileID(state).get(source.id, 0)
      },
    },
    totalPrints: {
      type: tql`Int!`,
      resolve(source, args, { store }) {
        const state = store.getState().jobQueue
        return getTotalPrintsByJobFileID(state).get(source.id)
      },
    },
    printsQueued: {
      type: tql`Int!`,
      resolve(source, args, { store }) {
        const state = store.getState()

        const total = getTotalPrintsByJobFileID(state.jobQueue).get(source.id)
        const printed = getIsDoneByJobFileID(state.jobQueue).get(source.id)
        const tasks = getTasksByTaskableID(state.spool).get(source.id, List())

        return total - (printed + tasks.size)
      },
    },
    isDone: {
      type: tql`Boolean!`,
      resolve(source, args, { store }) {
        const state = store.getState().jobQueue
        return getIsDoneByJobFileID(state).get(source.id)
      },
    },
  }),
})

export default JobFileGraphQL
