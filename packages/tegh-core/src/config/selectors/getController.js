import { createSelector } from 'reselect'
import getComponentsByType from './getComponentsByType'
import { CONTROLLER } from '../types/components/ComponentTypeEnum'

const getController = createSelector(
  getComponentsByType,
  (componentsByType) => {
    const controllers = componentsByType.get(CONTROLLER)
    if (controllers.size !== 1) {
      const err = (
        'There must only be 1 Controller '
        + `(${controllers.length} controllers configured)`
      )
      throw new Error(err)
    }
    return controllers.first()
  },
)

export default getController
