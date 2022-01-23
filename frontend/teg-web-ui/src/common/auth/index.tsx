import React, {
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  getAuth,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { initializeApp } from 'firebase/app'
import { useHistory } from 'react-router'

import signallingFetchOptions from './signallingFetchOptions'

const firebaseConfig = {
  apiKey: 'AIzaSyAMOxwDIhjjGHjsmRIMCn52MmBUt2AFT2s',
  projectId: 'printspool-io',
  authDomain: 'printspool-io.firebaseapp.com',
}

initializeApp(firebaseConfig);
const auth = getAuth();

const logInWithGoogle = () => {
  const googleAuthProvider = new GoogleAuthProvider()
  signInWithRedirect(auth, googleAuthProvider)
}

const registerUserWithPassword = async ({ email, password }) => {
  await createUserWithEmailAndPassword(auth, email, password)
}

const loginWithPassword = async ({ email, password }) => {
  await signInWithEmailAndPassword(auth, email, password)
}

const logOut = () => signOut(auth)

export const AuthContext = React.createContext({ isSignedIn: false } as any)

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
    onAuthStateChanged(auth, (nextUser) => {
      setState((state) => {
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
