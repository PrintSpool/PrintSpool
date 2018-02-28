import tql from 'typiql'
import snl from 'strip-newlines'
import {
  GraphQLObjectType
} from 'graphql'

import { getJobFilesFor, getJobQuantityCompleted } from '../reducers/jobQueueReducer'

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
      type: tql`[${JobFileGraphQLType}]!`,
      resolve(source, args, { store }) {
        const state = store.getState()
        const jobID = source.id
        return getJobFilesFor(state)({ jobID }).toJSON()
      }
    },

    tasks: {
      type tql`[${TaskType}]!`
      args: {
        excludeCompletedTasks: {
          type: tql`Boolean`,
          default: false,
        }
      }
      resolve(source, args, { store }) {
        const state = store.getState()
        return getTasksFor(state)({
          taskableID: source.id,
          excludeCompletedTasks,
        })
      }
    }
    tasksCompleted: {
      type: tql`Int!`,
      resolve(source, args, { store }) {
        const state = store.getState()
        return getTasksCompleted(state)({ taskableID: source.id })
      }
    },
    totalTasks: {
      type: tql`Int!`,
      resolve(source, args, { store }) {
        const state = store.getState()
        return getJobTotalTasks(state)({ jobID: source.id })
      }
    },
    status: {
      type: tql`${JobStatusGraphQLEnum}!`,
      resolve(source, args, { store }) {
        const state = store.getState()
        return getJobStatus(state)({ jobID: source.id })
      }
    },

    createdAt: {
      type: tql`String!`,
    },
    startedAt: {
      type: tql`String!`,
    },
    stoppedAt: {
      type: tql`String!`,
    },
  })
})

export default JobGraphQL
