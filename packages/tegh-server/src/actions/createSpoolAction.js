import uuid from 'uuid/v4'
import { Record, List } from 'immutable'

import Task from './task'

const createSpoolAction = ({
  priority,
  internal,
  fileName,
  data,
}) => ({
  type: 'SPOOL',
  task: Task(attrs),
})

export default createSpoolAction
