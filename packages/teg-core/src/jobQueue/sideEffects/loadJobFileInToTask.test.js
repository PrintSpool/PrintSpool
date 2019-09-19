import noPromiseFS from 'fs'

import Promise from 'bluebird'
import tmp from 'tmp-promise'

import expectToMatchImmutableSnapshot from '../../util/testing/expectToMatchImmutableSnapshot'
import loadJobFileInToTask from './loadJobFileInToTask'

const fs = Promise.promisifyAll(noPromiseFS)

describe('loadJobFileInToTask', () => {
  it('creates a Task', async () => {
    const jobFileID = 'test_test_test'
    const tmpFile = await tmp.file()
    const filePath = tmpFile.path
    await fs.writeFileAsync(filePath, 'g1 x10\ng1 y10')

    const jobFile = {
      id: jobFileID,
      jobID: '123',
      name: 'abc',
      filePath,
    }

    const result = await loadJobFileInToTask({
      jobFile,
    })

    expect(result).toMatchSnapshot()

    /* clean up tmp file */
    await fs.unlinkAsync(filePath)
  })
})
