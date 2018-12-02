import { Record } from 'immutable'
import typeDefs from 'tegh-schema'

import deterministicTestSetup from '../../util/testing/deterministicTestSetup'
import snapshotTestResolvers from '../../util/testing/snapshotTestResolvers'

import { MockConfig } from '../../config/types/Config'

import QueryResolvers from './QueryResolvers'

describe('QueryResolvers', () => {
  it('presents a consistent API', () => {
    deterministicTestSetup()

    const state = Record({
      config: MockConfig(),
    })()

    snapshotTestResolvers({
      typeDefs,
      typeName: 'Query',
      resolvers: QueryResolvers,
      rootValue: {},
      contextValue: {
        store: {
          getState: () => state,
        },
      },
    })
  })
})
