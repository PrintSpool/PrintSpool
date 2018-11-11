import { createSelector } from 'reselect'
import { getComponentsByType, ComponentTypeEnum } from 'tegh-core'

const { CONTROLLER } = ComponentTypeEnum

const getController = createSelector(
  getComponentsByType,
  (components) => {
    const controllers = components.get(CONTROLLER)
    if (controllers.length !== 1) {
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
