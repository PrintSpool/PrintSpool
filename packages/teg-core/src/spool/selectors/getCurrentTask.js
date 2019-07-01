import { createSelector } from 'reselect'

const getCurrentTask = createSelector(
  state => state.tasks.get(state.currentTaskID),
)

export default getCurrentTask
