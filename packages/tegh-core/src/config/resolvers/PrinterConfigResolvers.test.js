import { Record } from 'immutable'
import typeDefs from 'tegh-schema'

import deterministicTestSetup from '../../util/testing/deterministicTestSetup'
import snapshotTestResolvers from '../../util/testing/snapshotTestResolvers'

import { MockConfig } from '../types/Config'

import PrinterConfigResolvers from './PrinterConfigResolvers'

describe('PrinterConfigResolvers', () => {
  it('presents a consistent API', () => {
    deterministicTestSetup()

    const state = Record({
      config: MockConfig(),
    })()

    snapshotTestResolvers({
      typeDefs,
      typeName: 'PrinterConfig',
      resolvers: PrinterConfigResolvers,
      rootValue: state.config.printer,
      contextValue: {
        store: {
          getState: () => state,
        },
      },
    })
  })
})
