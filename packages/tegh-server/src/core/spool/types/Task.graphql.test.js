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

snapshotTestGraphQLType('TaskGraphQL', {
  type: TaskGraphQL,
  dynamicFields: [
    'id',
    'createdAt'
  ],
  rootValue: task,
})
