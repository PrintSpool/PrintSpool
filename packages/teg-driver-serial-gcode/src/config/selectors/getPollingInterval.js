import { createSelector } from 'reselect'
import { getController } from '@tegapp/core'

const getPollingInterval = createSelector(
  getController,
  controller => controller.model.get('temperaturePollingInterval'),
)

export default getPollingInterval
