import { Record, Map } from 'immutable'
import typeDefs from 'tegh-schema'

import deterministicTestSetup from '../../util/testing/deterministicTestSetup'
import snapshotTestResolvers from '../../util/testing/snapshotTestResolvers'

import { MockConfig } from '../../config/types/Config'
import { TOOLHEAD } from '../../config/types/components/ComponentTypeEnum'
import SchemaForm from '../types/SchemaForm'

import ComponentConfigFormResolvers from './ComponentConfigFormResolvers'

describe('ComponentConfigFormResolvers', () => {
  it('presents a consistent API', () => {
    deterministicTestSetup()

    const state = Record({
      schemaForms: Map({
        TOOLHEAD: SchemaForm({
          id: 'TOOLHEAD',
        }),
      }),
    })()

    snapshotTestResolvers({
      typeDefs,
      typeName: 'ComponentConfigForm',
      resolvers: ComponentConfigFormResolvers,
      rootValue: MockConfig().printer.components.find(c => c.type === TOOLHEAD),
      contextValue: {
        store: {
          getState: () => state,
        },
      },
    })
  })
})
