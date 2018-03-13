import path from 'path'
import {default as _fs} from 'fs'
import tmp from 'tmp-promise'
import Promise from 'bluebird'
import untildify from 'untildify'

import validateCommandsFileExtension from '../../util/validateCommandsFileExtension'
import Job from '../types/Job'
import JobFile from '../types/JobFile'

const fs = Promise.promisifyAll(_fs)
const normalize = filePath => path.normalize(untildify(filePath))

export const CREATE_JOB = 'tegh/jobQueue/CREATE_JOB'

const createJob = (args) => {
  return async (dispatch, getState) => {
    const variaticArgs = ['file', 'localPath']
    const nullArgCount = variaticArgs.filter(k => args[k] == null).length
    if (nullArgCount === variaticArgs.length) {
      throw new Error('file and localPath cannot both be null')
    }
    if (variaticArgs.length - nullArgCount > 1 ) {
      throw new Error('only one of file or localPath should be set')
    }

    let filePath, name

    if (args.localPath != null) {
      filePath = normalize(args.localPath)
      name = path.basename(filePath)
      const stats = await fs.lstatSyncAsync(filePath)

      const localPathConfig = getState().config.printFromLocalPath

      const isAllowedPath = localPathConfig.whitelist.some(validPath => {
        const normalizedValidPath = normalize(validPath)
        return filePath.startsWith(normalizedValidPath)
      })

      /* validation errors */
      if (localPathConfig.enabled === false) {
        throw new Error(`printing from localPaths is disabled`)
      }

      validateCommandsFileExtension(filePath)

      if (stats.isSymbolicLink() && !localPathConfig.allowSymlinks) {
        throw new Error(`localPath cannot be a symlink`)
      }
      if (!isAllowedPath) {
        return new Error(`localPath is not in a whitelisted directory`)
      }
    }
    if (args.file != null) {
      const tmpFile = await tmp.file()
      name = args.file.name
      filePath = tmpFile.path
      await fs.writeFileAsync(filePath, args.file.content)
    }

    const job = Job({ name })
    const jobFile = JobFile({
      name,
      filePath,
      isTempFile: args.file != null,
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
    store.dispatch(action)
  }
}

export default createJob
