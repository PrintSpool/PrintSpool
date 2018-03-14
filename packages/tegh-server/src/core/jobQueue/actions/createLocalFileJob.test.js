import path from 'path'
import tmp from 'tmp-promise'

import fs from '../../util/promisifiedFS'
import expectToMatchImmutableSnapshot from '../../util/testing/expectToMatchImmutableSnapshot'
import createLocalFileJob from './createLocalFileJob'

describe('createLocalFileJob', () => {
  it('creates a CREATE_JOB action', async function() {

    const tmpFile = await tmp.file({ postfix: '.gcode' })
    const localPath = tmpFile.path

    const getState = () => ({
      config: {
        printFromLocalPath: {
          enabled: true,
          whitelist: [
            '/otherDirectory',
            path.dirname(localPath),
          ]
        }
      }
    })
    const dispatch = action => action

    let result = await createLocalFileJob({
      localPath
    })(dispatch, getState)

    expectToMatchImmutableSnapshot({
      result,
      redactions: [
        ['payload', 'job', 'name'],
        ['payload', 'job', 'id'],
        ['payload', 'job', 'createdAt'],
        ['payload', 'jobFiles'],
      ],
    })

    const jobFiles = Object.values(result.payload.jobFiles)
    for (const jobFile of jobFiles) {
      expectToMatchImmutableSnapshot({
        result: jobFile,
        redactions: [
          ['name'],
          ['id'],
          ['filePath'],
        ],
      })
      const content = await fs.readFileAsync(jobFile.filePath, 'utf8')
      expect(content).toMatchSnapshot()

      /* clean up tmp file */
      await fs.unlinkAsync(jobFile.filePath)
    }

  })
})
