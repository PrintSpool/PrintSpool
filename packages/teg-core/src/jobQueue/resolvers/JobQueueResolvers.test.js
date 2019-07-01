import { Map } from 'immutable'
import typeDefs from '@tegapp/schema'

import deterministicTestSetup from '../../util/testing/deterministicTestSetup'
import snapshotTestResolvers from '../../util/testing/snapshotTestResolvers'

import { initialState as jobQueueState } from '../reducers/jobQueueReducer'
import { MockConfig } from '../../config/types/Config'
import Job from '../types/Job'

import JobQueueResolvers from './JobQueueResolvers'

describe('JobQueueResolvers', () => {
  it('presents a consistent API', () => {
    deterministicTestSetup()

    const job = Job({
      name: 'test job',
      internal: false,
      // priority: NORMAL,
      data: ['g1 x10', 'g1 y20'],
    })

    const state = {
      config: MockConfig(),
      jobQueue: jobQueueState.merge({
        jobs: Map({
          [job.id]: job,
        }),
      }),
    }

    snapshotTestResolvers({
      typeDefs,
      typeName: 'JobQueue',
      resolvers: JobQueueResolvers,
      rootValue: state,
      contextValue: {
        store: {
          getState: () => state,
        },
      },
    })
  })
})
