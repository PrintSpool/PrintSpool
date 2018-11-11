import { createSelector } from 'reselect'
import { getController } from 'tegh-core'

const getLongRunningCodes = createSelector(
  getController,
  controller => controller.longRunningCodes,
)

export default getLongRunningCodes
