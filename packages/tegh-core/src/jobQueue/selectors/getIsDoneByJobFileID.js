import { createSelector } from 'reselect'

import getPrintsCompletedByJobFileID from './getPrintsCompletedByJobFileID'
import getTotalPrintsByJobFileID from './getTotalPrintsByJobFileID'

const getIsDoneByJobFileID = createSelector(
  getPrintsCompletedByJobFileID,
  getTotalPrintsByJobFileID,
  (
    printsCompletedByJobFileID,
    totalPrintsByJobFileID,
  ) => (
    totalPrintsByJobFileID.map((total, jobFileID) => {
      const completed = printsCompletedByJobFileID.get(jobFileID, 0)

      return completed >= total
    })
  ),
)

export default getIsDoneByJobFileID
