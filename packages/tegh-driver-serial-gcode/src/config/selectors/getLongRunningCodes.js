import { createSelector } from 'reselect'
import { getController } from 'tegh-core'

const getLongRunningCodes = createSelector(
  getController,
  controller => controller.extendedConfig.longRunningCodes,
)

export default getLongRunningCodes
