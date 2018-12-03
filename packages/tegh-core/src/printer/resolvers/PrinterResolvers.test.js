import { Map, Record } from 'immutable'
import typeDefs from 'tegh-schema'

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

import PrinterResolvers from './PrinterResolvers'

describe('PrinterResolvers', () => {
  it('presents a consistent API', () => {
    deterministicTestSetup()

    const state = Record({
      config: MockConfig(),
      spool: spoolInitialState,
      status: statusInitialState.set('status', CONNECTING),
      macros: macrosInitialState.set('macros', Map({ myMacro: () => null })),
      log: logInitialState.setIn(['logEntries', 0], {
        source: 'SERIAL',
        level: INFO,
        message: 'This is an example log',
      }),
      'tegh-driver-serial-gcode': {
        components: Record({
          targetTemperaturesCountdown: 3,
          activeExtruderID: 'heater1ID',
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
      typeName: 'Printer',
      resolvers: PrinterResolvers,
      rootValue: state,
      contextValue: {
        store: {
          getState: () => state,
        },
      },
    })
  })
})
