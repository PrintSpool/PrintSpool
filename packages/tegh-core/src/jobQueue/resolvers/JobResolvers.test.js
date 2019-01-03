import { Map } from 'immutable'
import typeDefs from '@tegh/schema'

import deterministicTestSetup from '../../util/testing/deterministicTestSetup'
import snapshotTestResolvers from '../../util/testing/snapshotTestResolvers'

import { initialState as jobQueueState } from '../reducers/jobQueueReducer'
import { initialState as spoolState } from '../../spool/reducers/spoolReducer'
import Job from '../types/Job'
import JobFile from '../types/JobFile'
// import { NORMAL } from './PriorityEnum'

import JobResolvers from './JobResolvers'

describe('JobResolvers', () => {
  it('presents a consistent API', () => {
    deterministicTestSetup()

    const job = Job({
      name: 'test job',
      internal: false,
      // priority: NORMAL,
      data: ['g1 x10', 'g1 y20'],
    })

    const jobFile = JobFile({
      jobID: job.id,
      quantity: 1,
    })

    const task = {
      id: '123',
      jobID: job.id,
      jobFileID: jobFile.id,
    }

    const state = {
      jobQueue: jobQueueState.merge({
        jobs: Map({
          [job.id]: job,
        }),
        jobFiles: Map({
          [jobFile.id]: jobFile,
        }),
      }),
      spool: spoolState.merge({
        tasks: Map({
          [task.id]: task,
        }),
      }),
    }

    snapshotTestResolvers({
      typeDefs,
      typeName: 'Job',
      resolvers: JobResolvers,
      rootValue: job,
      contextValue: {
        store: {
          getState: () => state,
        },
      },
    })
  })
})
