import { Record, Map } from 'immutable'
import uuid from 'uuid'

import { CONTROLLER } from './ComponentTypeEnum'

export const SerialControllerConfigFactory = Record({
  id: null,
  modelVersion: 0,
  type: CONTROLLER,
  interface: 'SERIAL',
  name: null,
  serialPortID: null,
  baudRate: null,
  simulate: false,
  extendedConfig: Map(),
})

const SerialControllerConfig = ({
  id = uuid.v4(),
  modelVersion = 0,
  ...props
} = {}) => {
  if (props.interface != null && props.interface !== 'SERIAL') {
    throw new Error(`Unsupported controller interface: ${props.interface}`)
  }
  return SerialControllerConfigFactory({
    ...props,
    id,
    modelVersion,
    extendedConfig: Map(props.extendedConfig),
  })
}

export default SerialControllerConfig
