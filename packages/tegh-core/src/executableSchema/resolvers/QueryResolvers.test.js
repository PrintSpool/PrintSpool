import { Record, Map } from 'immutable'
import typeDefs from '@tegh/schema'

import deterministicTestSetup from '../../util/testing/deterministicTestSetup'
import snapshotTestResolvers from '../../util/testing/snapshotTestResolvers'

import { MockConfig } from '../../config/types/Config'

import QueryResolvers from './QueryResolvers'

describe('QueryResolvers', () => {
  it('presents a consistent API', () => {
    deterministicTestSetup()

    const state = Record({
      config: MockConfig(),
      schemaForms: Record({
        components: Map({
          TOOLHEAD: Record({
            id: 'TOOLHEAD',
          })(),
        }),
      })(),
      devices: Record({
        byID: Map({}),
      })(),
    })()

    snapshotTestResolvers({
      typeDefs,
      typeName: 'Query',
      resolvers: QueryResolvers,
      fieldArgs: {
        args: {},
        children: {
          schemaForm: {
            args: {
              input: {
                collection: ['__ENUM', 'COMPONENT'],
                printerID: state.config.printer.id,
                schemaFormKey: 'TOOLHEAD',
              },
            },
          },
        },
      },
      rootValue: {},
      contextValue: {
        store: {
          getState: () => state,
        },
      },
    })
  })
})
