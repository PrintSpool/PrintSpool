import React, { useState, useEffect } from 'react'
import { useAuth0 } from './auth0'

const WithAuth0Token = Child => (props) => {
  const auth0 = useAuth0()
  const [state, setState] = useState({ loading: true })

  useEffect(() => {
    if (!auth0.isAuthenticated) return

    const fetchData = async () => {
      const auth0Token = await auth0.getTokenSilently()
      setState({ loading: false, auth0Token })
    }

    fetchData()
  }, [auth0.isAuthenticated])

  if (state.loading) {
    return <div />
  }

  return (
    <Child auth0Token={state.auth0Token} {...props} />
  )
}

export default WithAuth0Token
