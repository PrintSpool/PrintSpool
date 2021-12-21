import React, {
  useContext,
  useEffect,
  useState,
} from 'react'
import 'firebase/auth'
import firebase from 'firebase/app'
import { useHistory } from 'react-router'

import signallingFetchOptions from './signallingFetchOptions'

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

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig)
}

const logInWithGoogle = () => {
  const googleAuthProvider = new firebase.auth.GoogleAuthProvider()
  firebase.auth().signInWithRedirect(googleAuthProvider)
}

const registerUserWithPassword = async ({ email, password }) => {
  await firebase.auth().createUserWithEmailAndPassword(email, password)
}

const loginWithPassword = async ({ email, password }) => {
  await firebase.auth().signInWithEmailAndPassword(email, password)
}

const logOut = () => firebase.auth().signOut()

export const AuthContext = React.createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({
  children,
}) => {
  const history = useHistory()
  const [{ user, loading }, setState] = useState({
    loading: true,
    user: null,
  })

  useEffect(() => {
    firebase.auth().onAuthStateChanged((nextUser) => {
      setState((state) => {
        console.log({ nextUser })
        if (state.user != null && nextUser == null) {
          console.log('logout!')
          // On logout return to the home page
          history.push('/')
        }

        return {
          loading: false,
          user: nextUser,
        }
      });
    })
  }, [])

  // if (error) {
  //   throw error
  // }

  if (loading) {
    return <div />
  }

  // console.log({ user, idToken })
  const getFetchOptions = async () => {
    return signallingFetchOptions(await user.getIdToken())
  }

  return (
    <AuthContext.Provider
      value={{
        isSignedIn: user != null,
        getIdToken: () => user.getIdToken(),
        user,
        logInWithGoogle,
        loginWithPassword,
        registerUserWithPassword,
        logOut,
        getFetchOptions,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
