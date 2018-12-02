import { Record } from 'immutable'
import typeDefs from 'tegh-schema'

import deterministicTestSetup from '../../util/testing/deterministicTestSetup'
import snapshotTestResolvers from '../../util/testing/snapshotTestResolvers'

import { MockConfig } from '../../config/types/Config'

import HeaterResolvers from './HeaterResolvers'

describe('JobResolvers', () => {
  it('presents a consistent API', () => {
    deterministicTestSetup()

    const state = Record({
      config: MockConfig(),
    })()

    snapshotTestResolvers({
      typeDefs,
      typeName: 'Heater',
      resolvers: HeaterResolvers,
      rootValue: Record({
        id: 'heater_1',
        address: 'e1',
        currentTemperature: 32,
        targetTemperature: 40,
        blocking: true,
      })(),
      contextValue: {
        store: {
          getState: () => state,
        },
      },
    })
  })
})
