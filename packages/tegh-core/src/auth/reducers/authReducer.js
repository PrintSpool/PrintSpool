import { loop, Cmd } from 'redux-loop'
import { Map, Record } from 'immutable'
import { ec as EC } from 'elliptic'

import displayInviteInConsole from '../sideEffects/displayInviteInConsole'

import { SET_CONFIG } from '../../config/actions/setConfig'

import createInvite from '../actions/createInvite'
import { DAT_PEER_HANDSHAKE_RECEIVED } from '../actions/datPeerHandshakeReceived'
import { DAT_PEER_DATA_RECEIVED } from '../actions/datPeerDataReceived'

const ec = new EC('curve25519')

const DatSession = Record({
  awaitingSDP: true,
  peerIdentityPublicKey: null,
  sessionKey: null,
})

export const initialState = Record({
  hostIdentityKeys: null,
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
          args: [{ hostPublicKey: hostIdentityKeys.getPublic(), invite }],
        }))
      ))

      return loop(state, Cmd.list(sideEffects))
    }
    case DAT_PEER_HANDSHAKE_RECEIVED: {
      const { payload } = action

      const peerIdentityKeys = ec.keyFromPublic(payload.identityPublicKey)
      const peerEphemeralKeys = ec.keyFromPublic(payload.ephemeralPublicKey)

      const { hostIdentityKeys } = state
      const hostEphemeralKeys = ec.genKeyPair()

      // triple diffie helman
      const dh1 = hostIdentityKeys.derive(peerEphemeralKeys.getPublic())
      const dh2 = hostEphemeralKeys.derive(peerIdentityKeys.getPublic())
      const dh3 = hostEphemeralKeys.derive(peerEphemeralKeys.getPublic())

      const sessionKey = 0//TODO

      const nextState = state
        .setIn(['datSessionKeysByPeerID', peerID], DatSession({
          peerIdentityPublicKey: payload.identityPublicKey,
          sessionKey,
        }))
      const nextAction = sendMessageToDatPeer({
        peers,
        peerID,
        message: {
          protocolVersion: 'A',
          type: 'HANDSHAKE_RES',
          payload: {
            ephemeralPublicKey: hostEphemeralKeys.getPublic(),
          }
        }
      })
      return loop(nextState, Cmd.action(nextAction))
    }
    case DAT_PEER_DATA_RECEIVED: {
      const { peerID, encryptedData } = action.payload
      const datSession = state.datSessionKeysByPeerID.get(peerID)

      if (datSession.awaitingSDP === false) {
        // ignore duplicate messages
        return
      }

      // TODO: decrypt the data somehow
      const data = "TODO"

      if (typeof data !== 'object' || data.sdp == null) {
        // end the session if invalid data is received
        return state.deleteIn(['datSessionKeysByPeerID', peerID])
      }

      const nextState = state
        .setIn(['datSessionsByPeerID', peerID, 'awaitingSDP'], false)

      const nextAction = Cmd.action(webRTCConnection, {
        args: {
          peerDatID: peerID,
          peerSDP: data.sdp,
        },
      })

      return loop(nextState, Cmd.action(nextAction))
    }
    case WebRTCSDPResponseCreated: {
      const nextState = state.deleteIn(['datSessionKeysByPeerID', peerID])
    }
    default: {
      return state
    }
  }
}

export default authReducer
