import { Record, Map } from 'immutable'
import typeDefs from 'tegh-schema'

import deterministicTestSetup from '../../util/testing/deterministicTestSetup'
import snapshotTestResolvers from '../../util/testing/snapshotTestResolvers'

import { MockConfig } from '../../config/types/Config'
import SchemaForm from '../types/SchemaForm'

import MaterialResolvers from './MaterialResolvers'

describe('MaterialResolvers', () => {
  it('presents a consistent API', () => {
    deterministicTestSetup()

    const state = Record({
      schemaForms: Map({
        FDM_FILAMENT: SchemaForm({
          id: 'FDM_FILAMENT',
        }),
      }),
    })()

    snapshotTestResolvers({
      typeDefs,
      typeName: 'Material',
      resolvers: MaterialResolvers,
      rootValue: MockConfig().materials.find(p => p.id === 'generic/pla'),
      contextValue: {
        store: {
          getState: () => state,
        },
      },
    })
  })
})
