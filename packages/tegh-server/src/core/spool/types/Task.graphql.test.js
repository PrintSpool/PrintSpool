import snapshotTestGraphQLType from '../../util/testing/snapshotTestGraphQLType'

import Task from './Task'
import { NORMAL } from './PriorityEnum'

import TaskGraphQL from './Task.graphql.js'

const task = Task({
  name: 'test task',
  internal: false,
  priority: NORMAL,
  data: ['g1 x10', 'g1 y20'],
})

const state = {
  config: {
    id: 'test_printer_id',
  },
}

snapshotTestGraphQLType('TaskGraphQL', {
  type: TaskGraphQL,
  fieldConfigs: {
    id: {
      dynamic: true,
    },
    createdAt: {
      dynamic: true,
    },
    percentComplete: {
      args: { digits: 5 },
    },
  },
  rootValue: task,
  contextValue: {
    store: {
      getState: () => state,
    },
  },
})
