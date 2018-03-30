import tql from 'typiql'

import subscriptionDefaults from '../../util/subscriptionDefaults'
import TaskType from '../types/Task.graphql.js'

const defaults = subscriptionDefaults(args => `taskChanged[${args.taskID}]`)

const taskChangedSubscription = () => ({
  name: 'taskChanged',
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
  selector: (state) => state.spool.allTasks,
  onSelectorChange: ({ newVal, oldVal, pubsub }) => {
    changedTasks = newVal.filter((k, v) => v !== oldVal[k])
    changedTasks.forEach((k, v) => {
      pubsub.publish(`taskChanged[${k}]`, newVal)
    })
  },
}
