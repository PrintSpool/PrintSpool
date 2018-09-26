import fs from 'fs'
import Promise from 'bluebird'

const unlinkAsync = Promise.promisify(fs.unlink)

/* unlink each temporary file */
const unlinkTmpFiles = tmpFilePaths => (
  Promise.all(
    tmpFilePaths.map(tmpFilePath => (
      unlinkAsync(tmpFilePath)
    )),
  )
)

export default unlinkTmpFiles
