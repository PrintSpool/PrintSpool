import { Map } from 'immutable'

import expectToMatchImmutableSnapshot from '../../util/testing/expectToMatchImmutableSnapshot'
import { EMERGENCY } from '../types/PriorityEnum'
import spoolMacro from './spoolMacro'

describe('spoolMacro', () => {
  it('creates a SPOOL_TASK action', async () => {
    const macroRunFn = ({ x }) => [`g1 x${x}`]
    macroRunFn.priority = EMERGENCY

    const pluginName = 'test_plugin'
    const macro = 'my_test_macro'
    const args = { x: 360 }

    const dispatch = action => action
    const getState = () => ({
      config: {
        initialized: true,
        pluginManager: {
          cache: Map({
            [pluginName]: {
              [macro]: macroRunFn,
            },
          }),
        },
        configForm: {
          macros: {
            [pluginName]: [macro],
          },
        },
      },
    })

    const result = await spoolMacro({
      macro,
      args,
    })(dispatch, getState)

    expectToMatchImmutableSnapshot({
      result,
      redactions: [
        ['payload', 'task', 'id'],
        ['payload', 'task', 'createdAt'],
      ],
    })
  })
})
