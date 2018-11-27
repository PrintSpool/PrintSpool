import actionResolver from '../../util/actionResolver'
import spoolMacro from '../actions/spoolMacro'

const spoolMacroResolver = actionResolver({
  actionCreator: spoolMacro,
  selector: () => null,
})

export default spoolMacroResolver
