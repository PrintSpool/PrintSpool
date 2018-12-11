import { Record, Map } from 'immutable'
import typeDefs from 'tegh-schema'

import deterministicTestSetup from '../../util/testing/deterministicTestSetup'
import snapshotTestResolvers from '../../util/testing/snapshotTestResolvers'

import { MockConfig } from '../../config/types/Config'
import SchemaForm from '../types/SchemaForm'

import PluginConfigFormResolvers from './PluginConfigFormResolvers'

describe('PluginConfigFormResolvers', () => {
  it('presents a consistent API', () => {
    deterministicTestSetup()

    const state = Record({
      schemaForms: Record({
        plugins: Map({
          'tegh-core': SchemaForm({
            id: 'tegh-core',
          }),
        }),
      })(),
    })()

    snapshotTestResolvers({
      typeDefs,
      typeName: 'PluginConfigForm',
      resolvers: PluginConfigFormResolvers,
      rootValue: MockConfig().printer.plugins.find(p => (
        p.package === 'tegh-core'
      )),
      contextValue: {
        store: {
          getState: () => state,
        },
      },
    })
  })
})
