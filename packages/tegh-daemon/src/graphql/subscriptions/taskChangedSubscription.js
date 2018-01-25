import tql from 'typiql'

import subscriptionDefaults from './helpers/subscriptionDefaults'
import TaskType from '../types/task_type.js'

const defaults = subscriptionDefaults(args => `taskChanged[${args.taskID}]`)

const taskChangedSubscription = () => ({
  type: tql`[${TaskType}!]!`,
  ...defaults,
  args: {
    ...defaults.args,
    taskID: {
      type: tql`ID!`,
    },
  },
})

export default {
  subscription: taskChangedSubscription,
  // TODO: dynamic selectors
  selector: (state) => state.spool.tasksByID,
  onSelectorChange: ({ newVal, oldVal, pubsub }) => {
    changedTasks = newVal.filter((k, v) => v !== oldVal[k])
    changedTasks.forEach((k, v) => {
      pubsub.publish(`taskChanged[${k}]`, newVal)
    })
  },
}
