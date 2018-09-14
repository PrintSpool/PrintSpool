import tql from 'typiql'
import {
  GraphQLObjectType,
} from 'graphql'

import getTasksCompleted from '../../spool/selectors/getTasksCompleted'
import getTasksFor from '../../spool/selectors/getTasksFor'
import getJobFileTotalTasks from '../selectors/getJobFileTotalTasks'
import getJobFileStatus from '../selectors/getJobFileStatus'

import TaskGraphQL from '../../spool/types/Task.graphql'
import JobStatusEnumGraphQL from './JobStatusEnum.graphql'

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
      args: {
        excludeCompletedTasks: {
          type: tql`Boolean`,
          default: false,
        },
      },
      resolve(source, args, { store }) {
        const { excludeCompletedTasks } = args
        const state = store.getState()

        return getTasksFor(state)({
          taskableID: source.id,
          excludeCompletedTasks,
        }).valueSeq().toArray()
      },
    },
    tasksCompleted: {
      type: tql`Int!`,
      resolve(source, args, { store }) {
        const state = store.getState()
        return getTasksCompleted(state)({ taskableID: source.id })
      },
    },
    totalTasks: {
      type: tql`Int!`,
      resolve(source, args, { store }) {
        const state = store.getState()
        return getJobFileTotalTasks(state)({ jobFileID: source.id })
      },
    },
    status: {
      type: tql`${JobStatusEnumGraphQL}!`,
      resolve(source, args, { store }) {
        const state = store.getState()
        return getJobFileStatus(state)({ jobFileID: source.id })
      },
    },
  }),
})

export default JobFileGraphQL
