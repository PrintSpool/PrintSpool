import { loop, Cmd } from 'redux-loop'
import { Map, Record } from 'immutable'

import displayInviteInConsole from '../sideEffects/displayInviteInConsole'
import { initInviteWithKeys } from '../../config/types/auth/Invite'

import { SET_CONFIG } from '../../config/actions/setConfig'

import createInvite from '../actions/createInvite'

export const initialState = Record({
  hostIdentityKeys: null,
  // accounts are users and invites mapped by their public key
  accounts: Map(),
})

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload
      const {
        users,
        invites,
        hostIdentityKeys,
      } = config.auth

      const admins = users.filter(user => user.admin)
      const adminInvites = invites.filter(invite => invite.admin)

      /*
       * If no invites exist and no admins exist then create an invite so the
       * initial user can connect
       */
      if (admins.size === 0 && adminInvites.size === 0) {
        return loop(state, Cmd.run(initInviteWithKeys, {
          args: [{
            hostIdentityKeys,
            displayInConsole: true,
            admin: true,
          }],
          successActionCreator: createInvite,
        }))
      }


      /*
       * Display invites in the console
       */
      const consoleInvites = invites.filter(invite => invite.displayInConsole)

      return loop(state, Cmd.list(
        consoleInvites.toArray().map(invite => (
          Cmd.run(displayInviteInConsole, {
            args: [{
              invite,
            }],
          })
        )),
      ))
    }
    default: {
      return state
    }
  }
}

export default authReducer
