import tql from 'typiql'
import {
  GraphQLObjectType,
} from 'graphql'

import getTasksCompleted from '../../spool/selectors/getTasksCompleted'
import getTasksFor from '../../spool/selectors/getTasksFor'
import getJobFileTotalTasks from '../selectors/getJobFileTotalTasks'
import getIsDoneByJobFileID from '../selectors/getIsDoneByJobFileID'

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
      resolve(source, args, { store }) {
        const state = store.getState()

        return getTasksByTaskableID(state).get(source.id)
      },
    },
    tasksCompleted: {
      type: tql`Int!`,
      resolve(source, args, { store }) {
        const state = store.getState()
        return getPrintsCompletedByID(state).get(source.id)
      },
    },
    totalTasks: {
      type: tql`Int!`,
      resolve(source, args, { store }) {
        const state = store.getState()
        return getTotalPrintsByID(state).get(source.id)
      },
    },
    status: {
      type: tql`${JobStatusEnumGraphQL}!`,
      resolve(source, args, { store }) {
        const state = store.getState()
        return getIsDoneByJobFileID(state)({ jobFileID: source.id })
      },
    },
  }),
})

export default JobFileGraphQL
