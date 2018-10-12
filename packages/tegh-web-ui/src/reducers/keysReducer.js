import { loop, Cmd } from 'redux-loop'
import { Record } from 'immutable'
import keypair from 'keypair'

import loadLocalStorageJSON from './sideEffects/loadLocalStorageJSON'
import saveLocalStorageJSON from './sideEffects/saveLocalStorageJSON'

export const initialState = Record({
  myIdentity: Record({
    public: null,
    private: null,
  })(),
  hostIdentity: Record({
    public: null,
  })(),
})().mergeIn(loadKeys())

const keysReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_KEYS: {
      return Cmd.loop(
        state,
        Cmd.run(loadLocalStorageJSON, {
          args: ['keys'],
          successActionCreator: keysLoaded,
        })
      )
    }
    case KEYS_LOADED: {
      // merge the existing identity JSON if it exists or create a new identity
      if (action.payload == null) {
        const nextState = state.deepMerge({
          myIdentity: keypair(),
        })

        return Cmd.loop(
          nextState,
          Cmd.action(saveKeys()),
        )
      }

      return state.deepMerge(action.payload)
    }
    case SAVE_KEYS: {
      return Cmd.loop(
        state,
        Cmd.run(saveLocalStorageJSON, {
          args: ['keys'],
          successActionCreator: keysLoaded,
        })
      )
    }
    default: {
      return state
    }
  }
}

export default keysReducer
