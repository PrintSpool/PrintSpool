import { loop, Cmd } from 'redux-loop'

import displayInviteInConsole from '../sideEffects/displayInviteInConsole'

import createInvite from '../actions/createInvite'
import { SET_CONFIG } from '../../config/actions/setConfig'

export const initialState = null

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload
      const { users, invites, hostDatID } = config.auth

      const admins = users.filter(user => user.admin)
      const adminInvites = invites.filter(invite => invite.admin)
      let consoleInvites = invites.filter(invite => invite.displayInConsole)

      const sideEffects = []

      /*
       * If no invites exist and no admins exist then create an invite so the
       * initial user can connect
       */
      if (admins.length === 0 && adminInvites.length === 0) {
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
        sideEffects.push(Cmd.run(displayInviteInConsole({ hostDatID, invite })))
      ))

      return loop(state, Cmd.list(sideEffects))
    }
    default: {
      return state
    }
  }
}

export default authReducer
