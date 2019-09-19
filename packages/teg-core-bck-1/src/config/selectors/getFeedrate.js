import { createSelector } from 'reselect'
import getComponents from './getComponents'

const getFeedrate = createSelector(
  getComponents,
  components => (k) => {
    const { feedrate } = components.get(k).model

    return feedrate
  },
)

export default getFeedrate
