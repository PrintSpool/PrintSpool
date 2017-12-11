// @flow
import spoolReducer from '../../src/reducers/spool_reducer'

describe('SPOOL action', () => {
  test(
    'adds to manualSpool',
    () => {
      const state = {
        manualSpool: ['Not one of those'],
        internalSpool: [],
        currentLine: 'A thing',
      }

      const action = {
        type: 'SPOOL',
        spoolID: 'manualSpool',
        data: ['Foo', 'Bar', 'Baz'],
      }

      const result = spoolReducer(state, action)

      expect(result.manualSpool[0]).toEqual(state.manualSpool[0])
      expect(result.manualSpool.slice(1)).toEqual(action.data)
    }
  )

  test(
    'adds to internalSpool',
    () => {
      const state = {
        manualSpool: [],
        internalSpool: ['Not one of those'],
        currentLine: 'A thing',
      }

      const action = {
        type: 'SPOOL',
        spoolID: 'internalSpool',
        data: ['Foo', 'Bar', 'Baz'],
      }

      const result = spoolReducer(state, action)

      expect(result.internalSpool[0]).toEqual(state.internalSpool[0])
      expect(result.internalSpool.slice(1)).toEqual(action.data)
    }
  )

  test(
    'if nothing is spooled then adds to the spool and sets the current line'
    , () => {
      const state = {
        manualSpool: [],
        internalSpool: [],
        currentLine: null,
      }

      const action = {
        type: 'SPOOL',
        spoolID: 'internalSpool',
        data: ['Foo', 'Bar', 'Baz'],
      }

      const result = spoolReducer(state, action)

      expect(result).toEqual({
        manualSpool: [],
        internalSpool: ['Bar', 'Baz'],
        currentLine: 'Foo',
      })
    }
  )
})

describe('DESPOOL action', () => {
  const action = {
    type: 'DESPOOL',
  }
  test(
    'sets currentLine to null on empty spools',
    () => {
      const state = {
        manualSpool: [],
        internalSpool: [],
        currentLine: 'A thing',
      }

      const result = spoolReducer(state, action)

      expect(result.currentLine).toBe(null)
    }
  )

  test(
    'prioritizes despooling from internalSpool',
    () => {
      const state = {
        manualSpool: ['Should not be next line'],
        internalSpool: ['foo'],
        currentLine: 'A thing',
      }

      const result = spoolReducer(state, action)

      expect(result).toEqual({
        ...state,
        internalSpool: [],
        currentLine: 'foo',
      })
    }
  )

  test(
    'despools from manualSpool if the internalSpool is empty',
    () => {
      const state = {
        manualSpool: ['baz'],
        internalSpool: [],
        currentLine: 'A thing',
      }

      const result = spoolReducer(state, action)

      expect(result).toEqual({
        ...state,
        manualSpool: [],
        currentLine: 'baz',
      })
    }
  )

})
