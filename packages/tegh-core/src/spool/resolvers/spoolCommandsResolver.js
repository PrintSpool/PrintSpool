import actionResolver from '../../util/actionResolver'
import spoolTask from '../actions/spoolTask'

const spoolCommandsResolver = actionResolver({
  actionCreator: spoolTask,
  selector: (state, action) => action.payload.task,
})

export default spoolCommandsResolver
