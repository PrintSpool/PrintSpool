import { createSelector } from 'reselect'
import { getController } from '@tegh/core'

const getSerialPortID = createSelector(
  getController,
  ({ id, model }) => {
    if (model.get('simulate')) {
      return `/tmp/printer-tegh-simulation-${id}`
    }

    return model.get('serialPortID')
  },
)

export default getSerialPortID
