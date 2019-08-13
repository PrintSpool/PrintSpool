import { List, Map, Record } from 'immutable'
import typeDefs from '@tegapp/schema'

import deterministicTestSetup from '../../util/testing/deterministicTestSetup'
import snapshotTestResolvers from '../../util/testing/snapshotTestResolvers'

import { CONNECTING } from '../types/statusEnum'
import { INFO } from '../../log/types/logLevelEnum'
import { TOOLHEAD, FAN } from '../../config/types/components/ComponentTypeEnum'

import { initialState as spoolInitialState } from '../../spool/reducers/spoolReducer'
import { initialState as macrosInitialState } from '../../macros/reducers/macrosReducer'
import { initialState as logInitialState } from '../../log/reducers/logReducer'
import { initialState as statusInitialState } from '../reducers/statusReducer'
import { MockConfig } from '../../config/types/Config'
import SchemaForm from '../../pluginManager/types/SchemaForm'

import MachineResolvers from './MachineResolvers'

describe('MachineResolvers', () => {
  it('presents a consistent API', () => {
    deterministicTestSetup()

    const state = Record({
      config: MockConfig(),
      schemaForms: Record({
        plugins: Map({
          '@tegapp/core': SchemaForm({
            id: '@tegapp/core',
          }),
          '@tegapp/driver-serial-gcode': SchemaForm({}),
          '@tegapp/macros-default': SchemaForm({}),
        }),
      })(),
      fixedListComponentTypes: List(['TOOLHEAD']),
      spool: spoolInitialState,
      status: statusInitialState.set('status', CONNECTING),
      macros: macrosInitialState.set('enabledMacros', List(['myMacro'])),
      log: logInitialState.setIn(['logEntries', 0], {
        source: 'SERIAL',
        level: INFO,
        message: 'This is an example log',
      }),
      driver: '@tegapp/driver-serial-gcode',
      '@tegapp/driver-serial-gcode': {
        components: Record({
          targetTemperaturesCountdown: 3,
          activeExtruderID: 'heater1ID',
          movementHistory: List([{ id: 9 }]),
          temperatureHistory: List([{ id: 5 }]),
          temperatureKeys: [],
          byID: Map({
            heater1Address: Record({
              id: 'heater1ID',
              type: TOOLHEAD,
            })(),
            fan1Address: Record({
              id: 'fan1ID',
              type: FAN,
            })(),
          }),
        })(),
      },
    })()

    snapshotTestResolvers({
      typeDefs,
      typeName: 'Machine',
      resolvers: MachineResolvers,
      rootValue: state,
      contextValue: {
        store: {
          getState: () => state,
        },
      },
    })
  })
})
