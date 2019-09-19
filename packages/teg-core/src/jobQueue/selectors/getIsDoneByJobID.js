import { createSelector } from 'reselect'

import getJobFilesByJobID from './getJobFilesByJobID'
import getIsDoneByJobFileID from './getIsDoneByJobFileID'

const getIsDoneByJobID = createSelector(
  getJobFilesByJobID,
  getIsDoneByJobFileID,
  (jobFilesByJobID, isDoneByJobFileID) => (
    jobFilesByJobID.map(jobFiles => (
      jobFiles.every(jobFile => isDoneByJobFileID.get(jobFile.id))
    ))
  ),
)

export default getIsDoneByJobID
