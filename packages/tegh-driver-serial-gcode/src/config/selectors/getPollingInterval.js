import { createSelector } from 'reselect'
import { getController } from 'tegh-core'

const getPollingInterval = createSelector(
  getController,
  controller => controller.extendedConfig.temperaturePollingInterval,
)

export default getPollingInterval
