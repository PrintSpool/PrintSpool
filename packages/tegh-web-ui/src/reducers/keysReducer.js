import { loop, Cmd } from 'redux-loop'
import { Record, Map } from 'immutable'
import keypair from 'keypair'

import loadLocalStorageJSON from '../sideEffects/loadLocalStorageJSON'
import saveLocalStorageJSON from '../sideEffects/saveLocalStorageJSON'

import { LOAD_KEYS } from '../actions/loadKeys'
import keysLoaded, { KEYS_LOADED } from '../actions/keysLoaded'
import saveKeys, { SAVE_KEYS } from '../actions/saveKeys'
import { ADD_HOST_IDENTITY } from '../actions/addHostIdentity'

export const initialState = Record({
  myIdentity: Record({
    public: null,
    private: null,
  })(),
  hostIdentities: Map(),
})()

const HostIdentity = Record({
  id: null,
  alias: null,
  public: null,
})

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
      // Generate a public and private key using the `keypair` npm module. This will
      // identify you to the 3D printer so you'll want to save this somewhere and
      // re-use it on future connections.
      if (action.payload == null) {
        const nextState = state
          .mergeIn(['myIdentity'], keypair())

        return loop(
          nextState,
          Cmd.action(saveKeys()),
        )
      }

      // merge the existing identity JSON if it exists
      const hostIdentities = Map(action.payload.hostIdentities || {})
        .map(json => HostIdentity(json))

      return state
        .mergeIn(['myIdentity'], action.payload.myIdentity)
        .set('hostIdentities', hostIdentities)
    }
    case SAVE_KEYS: {
      return loop(
        state,
        Cmd.run(saveLocalStorageJSON, {
          args: ['keys', state.toJS()],
        }),
      )
    }
    case ADD_HOST_IDENTITY: {
      const host = HostIdentity(action.payload.hostIdentity)

      const nextState = state.setIn(['hostIdentities', host.id], host)

      return loop(
        nextState,
        Cmd.action(saveKeys()),
      )
    }
    default: {
      return state
    }
  }
}

export default keysReducer
