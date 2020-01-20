import React from 'react'
import { Button } from '@material-ui/core'

import { useAuth0 } from './auth0'

const NavigationAuthLink = ({ ...buttonProps }) => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0()

  return (
    <>
      {!isAuthenticated && (
        <Button
          onClick={() => loginWithRedirect({})}
          {...buttonProps}
        >
          Log in
        </Button>
      )}

      {isAuthenticated && (
        <Button
          onClick={() => logout({})}
          {...buttonProps}
        >
          Log out
        </Button>
      )}
    </>
  )
}

export default NavigationAuthLink
