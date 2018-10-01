import tql from 'typiql'
import {
  GraphQLObjectType,
} from 'graphql'

import getJobFilesByJobID from '../selectors/getJobFilesByJobID'
import getTaskByTaskableID from '../../spool/selectors/getTasksByTaskableID'
import getPrintsCompletedByJobID from '../selectors/getPrintsCompletedByJobID'
import getTotalPrintsByID from '../selectors/getTotalPrintsByID'
import getIsDoneByJobID from '../selectors/getIsDoneByJobID'
import getJobHistoryByID from '../selectors/getJobHistoryByID'

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
        const state = store.getState()
        const jobID = source.id
        return getJobFilesByJobID(state).get(jobID)
      },
    },

    tasks: {
      type: tql`[${TaskGraphQL}]!`,
      resolve(source, args, { store }) {
        const state = store.getState()
        return getTasksByTaskableID(state).get(source.id)
      },
    },

    history: {
      type: tql`${JobHistoryEventGraphQL}!`,
      resolve(source, args, { store }) {
        const state = store.getState()
        return getJobHistoryByID(state).get(source.id)
      },
    },

    printsCompleted: {
      type: tql`Int!`,
      resolve(source, args, { store }) {
        const state = store.getState()
        return getPrintsCompletedByJobID(state).get(source.id)
      },
    },
    totalPrints: {
      type: tql`Int!`,
      resolve(source, args, { store }) {
        const state = store.getState()
        return getTotalPrintsByID(state).get(source.id)
      },
    },
    isDone: {
      type: tql`Boolean!`,
      resolve(source, args, { store }) {
        const state = store.getState()
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
