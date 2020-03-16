import React, {
  useContext,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useAsync } from 'react-async'
import 'firebase/auth'
import firebase from 'firebase/app'

import userProfileServerFetchOptions from './userProfileServerFetchOptions'

let firebaseConfig
if (process.env.NODE_ENV === 'production') {
  firebaseConfig = {
    apiKey: 'AIzaSyAdg0EKI4KQDTb0JYBos-EB775oNPzRpcE',
    projectId: 'tegapp-dev',
    // databaseURL: 'DATABASE_URL',
    authDomain: 'tegapp-dev.firebaseapp.com',
  }
} else {
  firebaseConfig = {
    apiKey: 'AIzaSyAdg0EKI4KQDTb0JYBos-EB775oNPzRpcE',
    projectId: 'tegapp-dev',
    // databaseURL: 'DATABASE_URL',
    authDomain: 'tegapp-dev.firebaseapp.com',
  }
}

firebase.initializeApp(firebaseConfig)

export const AuthContext = React.createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({
  children,
}) => {
  const [{ user, loading }, setState] = useState({
    loading: true,
    user: null,
  })

  useEffect(() => {
    firebase.auth().onAuthStateChanged((nextUser) => {
      setState({
        loading: false,
        user: nextUser,
      })
    })
  }, [])

  const { data: idToken, error } = useAsync({
    promiseFn: useCallback(async () => user && user.getIdToken(), [user]),
    // promiseFn: useCallback(async () => "wat", []),
    suspense: true,
  })

  if (error) {
    throw error
  }

  if (loading || (user != null && idToken == null)) {
    return <div />
  }

  console.log({ user, idToken })

  return (
    <AuthContext.Provider
      value={{
        isSignedIn: idToken != null,
        idToken,
        user,
        fetchOptions: userProfileServerFetchOptions(idToken),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
