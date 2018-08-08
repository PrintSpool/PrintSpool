import { utils as sagaUtils } from 'redux-saga'
const { SAGA_ACTION } = sagaUtils
import SagaTester from 'redux-saga-tester'
import tmp from 'tmp-promise'

import fs from '../../util/promisifiedFS'
import Job from '../types/Job'
import { initialState } from '../reducers/jobQueueReducer'
import { NORMAL } from '../../spool/types/PriorityEnum'
import { DONE } from '../types/JobStatusEnum'
import deleteJob, { DELETE_JOB } from '../actions/deleteJob'
import spoolTask from '../../spool/actions/spoolTask'
import Task from '../../spool/types/Task'

let jobDeletionSaga

const mockJob = () => Job({
  id: 'mock_job',
  name: 'test.ngc',
})

const mockTask = (attrs) => Task({
  name: 'test.ngc',
  priority: NORMAL,
  internal: false,
  data: ['g1 x10', 'g1 y20'],
  ...attrs,
})

const createTester = () => {
  const sagaTester = new SagaTester({
    initialState: {
      jobQueue: initialState
        .setIn(['jobs', mockJob().id], mockJob())
    },
  })
  sagaTester.start(jobDeletionSaga)
  return sagaTester
}

describe('SPOOL a job file', () => {
  const previousJob = mockJob({ status: DONE })
  let tmpFile = null

  beforeEach(async () => {
    tmpFile = (await tmp.file()).path
    await fs.writeFileAsync(tmpFile, 'test')
    jest.doMock('../selectors/getJobsByStatus', () => {
      const implementation = () => () => [previousJob]
      return jest.fn(implementation)
    })
    jest.doMock('../selectors/getJobTmpFiles', () => {
      const implementation = () => () => [tmpFile]
      return jest.fn(implementation)
    })

    jobDeletionSaga = require('./jobDeletionSaga').default
    await new Promise(resolve => setImmediate(resolve))
  })

  it('deletes the previous job and it\'s tmp files', async () => {
    const task = mockTask({
      jobID: 'next_job_id',
      jobFileID: 'next_job_file_id',
    })
    const action = spoolTask(task)

    /* a promise that waits for a change to the tmp file */
    let tmpFileDidChange = false
    const tmpFileChangePromise = new Promise(resolve => {
      const watcher = fs.watch(tmpFile, { persistent: false }, () => {
        watcher.close()
        resolve()
        tmpFileDidChange = true
      })
    })

    const sagaTester = createTester()
    sagaTester.dispatch(action)

    if (tmpFileDidChange === false) {
      await tmpFileChangePromise
    }

    const result = sagaTester.getCalledActions()

    expect(fs.existsSync(tmpFile)).toEqual(false)

    expect(result).toMatchObject([
      action,
      {
        type: DELETE_JOB,
        payload: { jobID: 'mock_job' },
      },
    ])
  })

  afterEach(async () => {
    jest.unmock('../selectors/getJobsByStatus')
    jest.unmock('../selectors/getJobTmpFiles')
    if (fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile)
    }
  })

})
