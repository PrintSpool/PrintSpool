import tql from 'typiql'
import snl from 'strip-newlines'
import {
  GraphQLObjectType
} from 'graphql'

import getJobFilesFor from '../selectors/getJobFilesFor'
import getTasksFor from '../../spool/selectors/getTasksFor'
import getTasksCompleted from '../../spool/selectors/getTasksCompleted'
import getJobTotalTasks from '../selectors/getJobTotalTasks'
import getJobStatus from '../selectors/getJobStatus'

import JobFileGraphQL from './JobFile.graphql.js'
import TaskGraphQL from '../../spool/types/Task.graphql.js'
import JobStatusEnumGraphQL from './JobStatusEnum.graphql.js'

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
        return getJobFilesFor(state)({ jobID })
      }
    },

    tasks: {
      type: tql`[${TaskGraphQL}]!`,
      args: {
        excludeCompletedTasks: {
          type: tql`Boolean!`,
        },
      },
      resolve(source, args, { store }) {
        const { excludeCompletedTasks } = args
        const state = store.getState()
        return getTasksFor(state)({
          taskableID: source.id,
          excludeCompletedTasks,
        }).values().toArray()
      }
    },

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
      },
    },
    status: {
      type: tql`${JobStatusEnumGraphQL}!`,
      resolve(source, args, { store }) {
        const state = store.getState()
        return getJobStatus(state)({ jobID: source.id })
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
  })
})

export default JobGraphQL
