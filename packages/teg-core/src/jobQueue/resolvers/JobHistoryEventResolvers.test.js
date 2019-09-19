import typeDefs from '@tegapp/schema'

import deterministicTestSetup from '../../util/testing/deterministicTestSetup'
import snapshotTestResolvers from '../../util/testing/snapshotTestResolvers'

import JobHistoryEvent from '../types/JobHistoryEvent'
import { FINISH_PRINT } from '../types/JobHistoryTypeEnum'

import JobHistoryEventResolvers from './JobHistoryEventResolvers'

describe('JobHistoryEventResolvers', () => {
  it('presents a consistent API', () => {
    deterministicTestSetup()

    const event = JobHistoryEvent({
      type: FINISH_PRINT,
    })


    snapshotTestResolvers({
      typeDefs,
      typeName: 'JobHistoryEvent',
      resolvers: JobHistoryEventResolvers,
      rootValue: event,
      contextValue: {},
    })
  })
})
