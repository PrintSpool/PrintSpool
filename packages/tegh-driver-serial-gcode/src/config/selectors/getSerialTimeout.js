import { createSelector } from 'reselect'
import { getController } from 'tegh-core'

const getSerialTimeout = createSelector(
  getController,
  controller => controller.extendedConfig.serialTimeout,
)

export default getSerialTimeout
