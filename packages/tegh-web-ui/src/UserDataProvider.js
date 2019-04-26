import React, {
  useState,
  useMemo,
} from 'react'

import readFile from './common/readFile'

export const UserDataContext = React.createContext({
  name: 'DatArchive',
})

const addHostToData = (prevData, { invite, name }) => ({
  ...prevData,
  hosts: {
    ...prevData.hosts,
    [invite.peerIdentityPublicKey]: {
      id: invite.peerIdentityPublicKey,
      name,
      // position: prevData.hosts.length,
      invite,
    },
  },
})

const UserDataProvider = ({
  children,
}) => {
  const [userData, setUserData] = useState(() => {
    const existingData = localStorage.getItem('userData')

    if (existingData != null) {
      return JSON.parse(existingData)
    }

    return {
      hosts: {},
      // myIdentity: null,
    }
  })

  const contextValue = useMemo(() => ({
    userData,
    ...userData,
    isAuthorized: Object.keys(userData.hosts).length > 0,
    importUserData: async (files) => {
      const text = await readFile(files[0])
      const nextData = JSON.parse(text)

      setUserData(() => {
        // persist the data to localStorage
        localStorage.setItem('userData', JSON.stringify(nextData))
        // save the data to the React Hook state
        return nextData
      })
    },
    addHost: (invite) => {
      setUserData((prevData) => {
        const nextData = addHostToData(prevData, invite)
        // persist the data to localStorage
        localStorage.setItem('userData', JSON.stringify(nextData))
        // save the data to the React Hook state
        return nextData
      })
    },
    setHostName: ({ id, name }) => {
      setUserData((prevData) => {
        const nextData = {
          ...prevData,
          hosts: {
            ...prevData.hosts,
            [id]: {
              ...prevData.hosts[id],
              name,
            },
          },
        }
        // persist the data to localStorage
        localStorage.setItem('userData', JSON.stringify(nextData))
        // save the data to the React Hook state
        return nextData
      })
    },
  }), [userData])

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserDataProvider
