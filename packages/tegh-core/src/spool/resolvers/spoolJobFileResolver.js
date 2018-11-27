import actionResolver from '../../util/actionResolver'
import spoolJobFile from '../actions/spoolJobFile'

const spoolJobFileResolver = actionResolver({
  actionCreator: spoolJobFile,
  // selector: (state, action) => action.payload.task,
  selector: () => null,
})

export default spoolJobFileResolver
