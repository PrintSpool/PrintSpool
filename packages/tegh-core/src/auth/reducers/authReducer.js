import { loop, Cmd } from 'redux-loop'
import { Map, Record } from 'immutable'
import { ec as EC } from 'elliptic'

import displayInviteInConsole from '../sideEffects/displayInviteInConsole'

import { SET_CONFIG } from '../../config/actions/setConfig'

import createInvite from '../actions/createInvite'
import { DAT_PEER_HANDSHAKE_RECEIVED } from '../actions/datPeerHandshakeReceived'
import { DAT_PEER_DATA_RECEIVED } from '../actions/datPeerDataReceived'

const ec = new EC('curve25519')

export const initialState = Record({
  hostKeys: null,
  usersAndInvitesByPublicKey: Map(),
  datSessionsByPeerID: Map(),
})

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload
      const { users, invites } = config.auth

      const admins = users.filter(user => user.admin)
      const adminInvites = invites.filter(invite => invite.admin)
      let consoleInvites = invites.filter(invite => invite.displayInConsole)

      const sideEffects = []

      /*
       * If no invites exist and no admins exist then create an invite so the
       * initial user can connect
       */
      if (admins.size === 0 && adminInvites.size === 0) {
        const nextAction = createInvite({
          displayInConsole: true,
          admin: true,
        })
        consoleInvites = consoleInvites.push(nextAction.payload.invite)
        sideEffects.push(Cmd.action(nextAction))
      }

      /*
       * Display invites in the console
       */
      consoleInvites.forEach(invite => (
        sideEffects.push(Cmd.run(displayInviteInConsole, {
          args: [{ hostPublicKey: hostKeys.getPublic(), invite }],
        }))
      ))

      return loop(state, Cmd.list(sideEffects))
    }
    case DAT_PEER_HANDSHAKE_RECEIVED: {
      const hostEphemeralKeys = ec.genKeyPair()
      hostEphemeralKeys.getPublic()
    }
    case DAT_PEER_DATA_RECEIVED: {
    }
    default: {
      return state
    }
  }
}

export default authReducer
