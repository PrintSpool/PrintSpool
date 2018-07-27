import path from 'path'
import tmp from 'tmp-promise'
import untildify from 'untildify'

import fs from '../../util/promisifiedFS'
import validateCommandsFileExtension from '../../util/validateCommandsFileExtension'
import Job from '../types/Job'
import JobFile from '../types/JobFile'
import { CREATE_JOB } from './createJob'

const normalize = filePath => path.normalize(untildify(filePath))

const createLocalFileJob = (args) => {
  return async (dispatch, getState) => {

    if (args.localPath === null) {
      throw new Error('localPath must be a string')
    }

    const filePath = normalize(args.localPath)
    const name = path.basename(filePath)

    const stats = await fs.lstatAsync(filePath)

    const localPathConfig = getState().config.printFromLocalPath

    const isAllowedPath = localPathConfig.whitelist.some(validPath => {
      const normalizedValidPath = normalize(validPath)
      return filePath.startsWith(normalizedValidPath)
    })

    /* validation errors */

    if (localPathConfig.enabled !== true) {
      throw new Error(`printing from localPaths is disabled`)
    }

    validateCommandsFileExtension(filePath)

    if (stats.isSymbolicLink() && !localPathConfig.allowSymlinks) {
      throw new Error(`localPath cannot be a symlink`)
    }

    if (!isAllowedPath) {
      return new Error(`localPath is not in a whitelisted directory`)
    }

    /* create the types and actions */
    const job = Job({ name })
    const jobFile = JobFile({
      jobID: job.id,
      name,
      filePath,
      isTmpFile: false,
      quantity: 1,
    })

    const action = {
      type: CREATE_JOB,
      payload: {
        job,
        jobFiles: {
          [jobFile.id]: jobFile,
        },
      },
    }

    return dispatch(action)
  }
}

export default createLocalFileJob
