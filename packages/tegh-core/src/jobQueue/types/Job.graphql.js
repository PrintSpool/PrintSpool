import tql from 'typiql'
import {
  GraphQLObjectType,
} from 'graphql'
import { List } from 'immutable'

import getJobFilesByJobID from '../selectors/getJobFilesByJobID'
import getTasksByTaskableID from '../../spool/selectors/getTasksByTaskableID'
import getPrintsCompletedByJobID from '../selectors/getPrintsCompletedByJobID'
import getTotalPrintsByJobID from '../selectors/getTotalPrintsByJobID'
import getIsDoneByJobID from '../selectors/getIsDoneByJobID'
import getHistoryByJobID from '../selectors/getHistoryByJobID'

import JobFileGraphQL from './JobFile.graphql'
import TaskGraphQL from '../../spool/types/Task.graphql'
import JobHistoryEventGraphQL from './JobHistoryEvent.graphql'

const JobGraphQL = new GraphQLObjectType({
  name: 'Job',
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

    files: {
      type: tql`[${JobFileGraphQL}]!`,
      resolve(source, args, { store }) {
        const state = store.getState().jobQueue
        const jobID = source.id
        return getJobFilesByJobID(state).get(jobID, List())
      },
    },

    tasks: {
      type: tql`[${TaskGraphQL}]!`,
      resolve(source, args, { store }) {
        const state = store.getState().spool
        return getTasksByTaskableID(state).get(source.id, List())
      },
    },

    history: {
      type: tql`[${JobHistoryEventGraphQL}]!`,
      resolve(source, args, { store }) {
        const state = store.getState().jobQueue
        return getHistoryByJobID(state).get(source.id, List())
      },
    },

    printsCompleted: {
      type: tql`Int!`,
      resolve(source, args, { store }) {
        const state = store.getState().jobQueue
        return getPrintsCompletedByJobID(state).get(source.id, 0)
      },
    },
    totalPrints: {
      type: tql`Int!`,
      resolve(source, args, { store }) {
        return 1
        const state = store.getState().jobQueue
        return getTotalPrintsByJobID(state).get(source.id)
      },
    },
    isDone: {
      type: tql`Boolean!`,
      resolve(source, args, { store }) {
        const state = store.getState().jobQueue
        return getIsDoneByJobID(state).get(source.id)
      },
    },

    createdAt: {
      type: tql`String!`,
    },
    startedAt: {
      type: tql`String`,
    },
    stoppedAt: {
      type: tql`String`,
    },
  }),
})

export default JobGraphQL
