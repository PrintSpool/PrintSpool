import actionResolver from '../../util/actionResolver'
import deleteJob from '../actions/deleteJob'

const deleteJobResolver = actionResolver({
  actionCreator: deleteJob,
  selector: () => null,
  requirePrinterID: false,
})

export default deleteJobResolver
