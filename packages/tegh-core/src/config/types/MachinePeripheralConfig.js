import { Record, Map } from 'immutable'
import t from 'tcomb-validation'

import PeripheralTypeEnum from './PeripheralTypeEnum'

export const MachinePeripheralConfigStruct = t.struct({
  id: t.String,
  type: t.enums.of(PeripheralTypeEnum.toArray()),
  name: t.String,
  // TODO: validate that feedrate and materialID are set for extruders
  feedrate: t.maybe(t.Number),
  materialID: t.maybe(t.String),
})

const MachinePeripheralConfig = Record(
  Map(MachinePeripheralConfigStruct.meta.props).map(() => null),
)

export default MachinePeripheralConfig
