import { createSelector } from 'reselect'

import getPrintsCompletedByJobFileID from './getPrintsCompletedByJobFileID'
import getTotalPrintsByJobFileID from './getTotalPrintsByJobFileID'

const getIsDoneByJobFileID = createSelector(
  state => state,
  (state) => {
    const printsCompletedByJobFileID = getPrintsCompletedByJobFileID(state)
    const totalPrintsByJobFileID = getTotalPrintsByJobFileID(state)

    return state.jobFiles.map((jobFile) => {
      const completed = printsCompletedByJobFileID.get(jobFile.id, 0)
      const total = totalPrintsByJobFileID.get(jobFile.id, 0)

      return completed >= total
    })
  },
)

export default getIsDoneByJobFileID
