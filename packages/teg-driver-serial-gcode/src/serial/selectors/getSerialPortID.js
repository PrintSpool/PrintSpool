import { createSelector } from 'reselect'
import { getController } from '@tegapp/core'

const getSerialPortID = createSelector(
  getController,
  ({ id, model }) => {
    if (model.get('simulate')) {
      return `/tmp/printer-teg-simulation-${id}`
    }

    return model.get('serialPortID')
  },
)

export default getSerialPortID
