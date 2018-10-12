import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'
import keypair from 'keypair'

import loadLocalStorageJSON from '../sideEffects/loadLocalStorageJSON'
import saveLocalStorageJSON from '../sideEffects/saveLocalStorageJSON'

import { LOAD_KEYS } from '../actions/loadKeys'
import keysLoaded, { KEYS_LOADED } from '../actions/keysLoaded'
import saveKeys, { SAVE_KEYS } from '../actions/saveKeys'

export const initialState = Record({
  myIdentity: Record({
    public: null,
    private: null,
  })(),
  hostIdentity: Record({
    public: null,
  })(),
})()

const keysReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_KEYS: {
      return loop(
        state,
        Cmd.run(loadLocalStorageJSON, {
          args: ['keys'],
          successActionCreator: keysLoaded,
        }),
      )
    }
    case KEYS_LOADED: {
      // merge the existing identity JSON if it exists or create a new identity
      if (action.payload == null) {
        const nextState = state.mergeDeep({
          myIdentity: keypair(),
        })

        return loop(
          nextState,
          Cmd.action(saveKeys()),
        )
      }

      return state.mergeDeep(action.payload)
    }
    case SAVE_KEYS: {
      return loop(
        state,
        Cmd.run(saveLocalStorageJSON, {
          args: ['keys', state],
        }),
      )
    }
    default: {
      return state
    }
  }
}

export default keysReducer
