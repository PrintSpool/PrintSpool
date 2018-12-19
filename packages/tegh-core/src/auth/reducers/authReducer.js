import { loop, Cmd } from 'redux-loop'
import { Map, Record } from 'immutable'

import displayInviteInConsole from '../sideEffects/displayInviteInConsole'

import { SET_CONFIG } from '../../config/actions/setConfig'

import createInvite from '../actions/createInvite'
import { DAT_PEER_HANDSHAKE_RECEIVED } from '../actions/datPeerHandshakeReceived'
import { DAT_PEER_DATA_RECEIVED } from '../actions/datPeerDataReceived'

// Handshake Session state machine
const CREATING_HANDSHAKE_RESPONSE = 'CREATING_HANDSHAKE_RESPONSE'
const AWAITING_SDP = 'AWAITING_SDP'
// const AWAITING_WEB_RTC = 'AWAITING_WEB_RTC'

const HandshakeSession = Record({
  state: null,
  peerDatID: null,
  peerIdentityPublicKey: null,
  sessionID: null,
  sessionKey: null,
})

export const initialState = Record({
  hostIdentityKeys: null,
  byPublicKey: Map(),
  handshakeSessions: Map(),
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
          args: [{ hostPublicKey: hostIdentityKeys.getPublic(), invite }],
        }))
      ))

      return loop(state, Cmd.list(sideEffects))
    }
    case PEER_HANDSHAKE_RECEIVED: {
      const { peerDatID, request } = action.payload
      const { sessionID } = request

      if (state.getIn(['handshakeSessions', sessionID]) != null) {
        // duplicate session IDs are invalid
        return state
      }

      if (state.byPublicKey.get(request.identityPublicKey) == null) {
        // unauthorized access
        return state
      }

      const session = HandshakeSession({
        state: CREATING_HANDSHAKE_RESPONSE,
        peerIdentityPublicKey: request.identityPublicKey,
        peerDatID,
        sessionID,
      })

      const nextState = state.setIn(['handshakeSessions', sessionID], session)

      return loop(nextState, Cmd.run(sendHandshakeResponse, {
        args: {
          peers: state.peers,
          peerDatID: state.getIn(['handshakeSessions', sessionID, 'peerDatID']),
          identityKeys: state.hostIdentityKeys,
          request,
        },
        successActionCreator: peerHandshakeResponseSent,
        failureActionCreator: () => peerHandshakeFailure({ sessionID }),
      }))
    }
    case PEER_HANDSHAKE_RESPONSE_SENT: {
      const { sessionKey, response } = action.payload
      const { sessionID } = response

      return state.mergeIn(['handshakeSessions', sessionID], {
        state: AWAITING_SDP,
        sessionKey,
      })
    }
    case PEER_DATA_RECEIVED: {
      // TODO: decrypt the data in the async code before this action
      const { peerDatID, sessionID, data } = action.payload
      const session = state.handshakeSessions.get(sessionID)

      if (
        session == null
        || session.peerDatID !== peerDatID
        || session.state !== AWAITING_SDP
      ) {
        // ignore invalid or duplicate messages
        return
      }

      const nextState = state.deleteIn(['handshakeSessions', sessionID])

      return loop(nextState, Cmd.run(webRTCConnection, {
        args: {
          peers: state.peers,
          peerDatID: session.peerDatID,
          sessionID,
          sessionKey: session.sessionKey,
          sdp: data.sdp,
        },
        failureActionCreator: () => peerHandshakeFailure({ sessionID }),
      }))
    }
    case PEER_HANDSHAKE_FAILURE: {
      const { sessionID } = action.payload

      return state.deleteIn(['handshakeSessions', sessionID])
    }
    default: {
      return state
    }
  }
}

export default authReducer
