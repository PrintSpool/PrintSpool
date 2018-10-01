import tql from 'typiql'
import {
  GraphQLObjectType,
} from 'graphql'

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
        const state = store.getState()
        const tasks = getTasksByTaskableID(state).get(source.id)

        return tasks
      },
    },
    printsCompleted: {
      type: tql`Int!`,
      resolve(source, args, { store }) {
        const state = store.getState()
        return getPrintsCompletedByJobFileID(state).get(source.id)
      },
    },
    totalPrints: {
      type: tql`Int!`,
      resolve(source, args, { store }) {
        const state = store.getState()
        return getTotalPrintsByJobFileID(state).get(source.id)
      },
    },
    isDone: {
      type: tql`Boolean!`,
      resolve(source, args, { store }) {
        const state = store.getState()
        return getIsDoneByJobFileID(state).get(source.id)
      },
    },
  }),
})

export default JobFileGraphQL
