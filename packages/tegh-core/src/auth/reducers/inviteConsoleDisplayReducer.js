import { loop, Cmd } from 'redux-loop'
import { Map, Record } from 'immutable'

import displayInviteInConsole from '../sideEffects/displayInviteInConsole'

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
      let consoleInvites = invites.filter(invite => invite.displayInConsole)

      let sideEffects = []

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
      sideEffects = sideEffects.concat(consoleInvites.map(invite => (
        Cmd.run(displayInviteInConsole, {
          args: [{ hostPublicKey: hostIdentityKeys.getPublic(), invite }],
        })
      )))

      return loop(state, Cmd.list(sideEffects))
    }
    default: {
      return state
    }
  }
}

export default authReducer
