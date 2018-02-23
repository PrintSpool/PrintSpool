import tql from 'typiql'
import snl from 'strip-newlines'
import {
  GraphQLObjectType
} from 'graphql'

import { getTasksCompleted } from '../../spool/reducers/spoolReducer'

const JobFileGraphQLType = new GraphQLObjectType({
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
        return getJobFileTotalTasks(state)({ jobFileID: source.id })
      }
    },
    status: {
      type: tql`${JobStatusGraphQLEnum}!`,
      resolve(source, args, { store }) {
        const state = store.getState()
        return getJobFileStatus(state)({ jobFileID: source.id })
      }
    },
  })
})

export default JobFileGraphQLType
