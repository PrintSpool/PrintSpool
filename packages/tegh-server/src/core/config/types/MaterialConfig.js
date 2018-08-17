import { Record } from 'immutable'
import t from 'tcomb-validation'

export const MaterialConfigStruct = t.struct({
  targetTemperature: t.Number,
  targetBedTemperature: t.Number,
})

const MaterialConfig = Record(
  Map(MaterialConfigStruct.meta.props).mapValues(() => null),
)

export default MaterialConfig
