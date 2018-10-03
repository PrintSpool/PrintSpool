import { Record, Map } from 'immutable'
import t from 'tcomb-validation'

import PeripheralTypeEnum from './PeripheralTypeEnum'

export const MachinePeripheralConfigStruct = t.struct({
  type: t.emums(PeripheralTypeEnum.toArray()),
  name: t.String,
  // TODO: validate that feedrate and materialID are set for extruders
  feedrate: t.optional(t.Number),
  materialID: t.optional(t.String),
})

const MachinePeripheralConfig = Record(
  Map(MachinePeripheralConfigStruct.meta.props).map(() => null),
)

export default MachinePeripheralConfig
