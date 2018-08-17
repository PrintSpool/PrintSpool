import { Record } from 'immutable'
import t from 'tcomb-validation'

import PeripheralTypeEnum from './PeripheralTypeEnum'

export const MachinePeripheralConfigStruct = t.struct({
  type: t.emums(PeripheralTypeEnum.toArray()),
  feedrate: t.Number,
  materialID: t.String,
})

const MachinePeripheralConfig = Record(
  Map(MachinePeripheralConfigStruct.meta.props).mapValues(() => null),
)

export default MachinePeripheralConfig
