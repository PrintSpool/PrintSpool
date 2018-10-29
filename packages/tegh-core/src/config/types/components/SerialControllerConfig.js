import { Record } from 'immutable'
import uuid from 'uuid/v4'

import { CONTROLLER } from './ComponentTypeEnum'

export const SerialControllerConfigFactory = Record({
  id: null,
  type: CONTROLLER,
  interface: 'SERIAL',
  name: null,
  serialPortID: null,
  baudRate: null,
  simulate: false,
})

const SerialControllerConfig = ({
  ...props
}) => {
  if (props.interface != null && props.interface !== 'SERIAL') {
    throw new Error(`Unsupported controller interface: ${props.interface}`)
  }
  SerialControllerConfigFactory({
    id: props.id || uuid(),
    ...props,
  })
}

export default SerialControllerConfig
