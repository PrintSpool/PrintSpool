import expectToMatchImmutableSnapshot from '../../util/testing/expectToMatchImmutableSnapshot'
import spoolMacro from './spoolMacro'

describe('spoolMacro', () => {
  it('creates a SPOOL_TASK action', async function() {
    const macro = 'my_test_macro'
    const args = {x: 360}

    const dispatch = action => action
    const getState = () => ({
      macros: {
        [macro]: {
          name: macro,
          priority: 'emergency',
          run: ({x}) => [`g1 x${x}`]
        }
      }
    })

    const result = await spoolMacro({
      macro,
      args,
    })(dispatch, getState)

    expectToMatchImmutableSnapshot({
      result,
      redactions: [
        ['payload', 'task', 'id'],
        ['payload', 'task', 'createdAt']
      ],
    })
  })
})
