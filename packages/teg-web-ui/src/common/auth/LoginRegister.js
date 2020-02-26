import React, {  useEffect } from 'react'
import {
  useLocation,
} from 'react-router'

import MuiLoginRegister, { PROVIDER_GOOGLE } from 'react-mui-login-register'

import StaticTopNavigation from '../topNavigation/StaticTopNavigation'
import loginWithOAuthRedirect from './loginWithOAuthRedirect'

const LoginRegister = () => {
  const location = useLocation()
  useEffect(() => {
    localStorage.setItem('redirectURL', location.pathname + location.search)
  }, [])

  return (
    <MuiLoginRegister
      header={<StaticTopNavigation />}
      providers={[PROVIDER_GOOGLE]}
      onLogin={() => {}}
      onLoginWithProvider={() => loginWithOAuthRedirect()}
      onRegister={() => {}}
      onRegisterWithProvider={() => {}}
    />
  )
}

export default LoginRegister
