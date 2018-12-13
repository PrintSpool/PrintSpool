import { Map, Record } from 'immutable'
import typeDefs from 'tegh-schema'

import deterministicTestSetup from '../../util/testing/deterministicTestSetup'
import snapshotTestResolvers from '../../util/testing/snapshotTestResolvers'

import { MockConfig } from '../../config/types/Config'

import ComponentResolvers from './ComponentResolvers'
import SchemaForm from '../../pluginManager/types/SchemaForm'

describe('ComponentResolvers', () => {
  it('presents a consistent API', () => {
    deterministicTestSetup()

    const state = Record({
      driver: 'tegh-driver-serial-gcode',
      config: MockConfig(),
      schemaForms: Record({
        components: Map({
          TOOLHEAD: SchemaForm({}),
        }),
      })(),
      'tegh-driver-serial-gcode': {
        components: Record({
          byAddress: Map({
            e1: Record({
              id: 'heater_1',
              address: 'e1',
              currentTemperature: 32,
              targetTemperature: 40,
              blocking: true,
            })(),
          }),
        })(),
      },
    })()

    snapshotTestResolvers({
      typeDefs,
      typeName: 'Component',
      resolvers: ComponentResolvers,
      rootValue: state.config.printer.components.find(c => c.id === 'heater_1'),
      contextValue: {
        store: {
          getState: () => state,
        },
      },
    })
  })
})
