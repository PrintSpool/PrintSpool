import React from 'react'
import { Button } from '@material-ui/core'

import { useAuth0 } from './auth0'

const NavigationAuthLink = ({ buttonClass }) => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0()

  return (
    <div>
      {!isAuthenticated && (
        <Button
          className={buttonClass}
          onClick={() => loginWithRedirect({})}
        >
          Log in
        </Button>
      )}

      {isAuthenticated && (
        <Button
          className={buttonClass}
          onClick={() => logout({})}
        >
          Log out
        </Button>
      )}
    </div>
  )
}

export default NavigationAuthLink
