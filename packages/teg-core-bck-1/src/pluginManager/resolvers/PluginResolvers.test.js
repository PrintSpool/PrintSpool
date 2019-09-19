import { Record, Map } from 'immutable'
import typeDefs from '@tegapp/schema'

import deterministicTestSetup from '../../util/testing/deterministicTestSetup'
import snapshotTestResolvers from '../../util/testing/snapshotTestResolvers'

import { MockConfig } from '../../config/types/Config'
import SchemaForm from '../types/SchemaForm'

import PluginResolvers from './PluginResolvers'

describe('PluginResolvers', () => {
  it('presents a consistent API', () => {
    deterministicTestSetup()

    const state = Record({
      schemaForms: Record({
        plugins: Map({
          '@tegapp/core': SchemaForm({
            id: '@tegapp/core',
          }),
        }),
      })(),
    })()

    snapshotTestResolvers({
      typeDefs,
      typeName: 'Plugin',
      resolvers: PluginResolvers,
      rootValue: MockConfig().printer.plugins.find(p => (
        p.package === '@tegapp/core'
      )),
      contextValue: {
        store: {
          getState: () => state,
        },
      },
    })
  })
})
