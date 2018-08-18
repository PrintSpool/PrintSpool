import { Record } from 'immutable'
import t from 'tcomb-validation'

export const MachineAxisConfigStruct = t.struct({
  feedrate: t.Number,
})

const MachineAxisConfig = Record(
  Map(MachineAxisConfigStruct.meta.props).mapValues(() => null),
)

export default MachineAxisConfig
