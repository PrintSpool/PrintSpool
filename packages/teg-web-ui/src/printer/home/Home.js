import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { useGraphQL } from 'graphql-react'

import {
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@material-ui/core'

// import { UserDataContext } from '../../UserDataProvider'
import { useAuth0 } from '../../common/auth/auth0'

import HomeStyles from './HomeStyles'

import StaticTopNavigation from '../../common/topNavigation/StaticTopNavigation'
import NavigationAuthLink from '../../common/auth/NavigationAuthLink'
import PrintButton from '../printButton/PrintButton'

const WithAuth0Token = Child => props => {
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

  if (loading) {
    return <div></div>
  }

  return (
    <Child auth0Token={state.auth0Token} {...props} />
  )
}

// const useUserProfile = (query) => {
//   const auth0 = useAuth0()
//   const [state, setState] = useState({ loading: true })

//   useEffect(() => {
//     if (!auth0.isAuthenticated) return

//     const fetchData = async () => {
//       // const url = 'https://app-f49757b3-f48d-4078-8e8c-47b27b8b9d6d.cleverapps.io/graphql'
//       const url = 'http://localhost:8080/graphql'

//       const token = await auth0.getTokenSilently()

//       const headers = new Headers({
//         Authorization: `Bearer ${token}`,
//         ContentType: 'application/json',
//       })

//       const req = new Request(url, {
//         method: 'POST',
//         mode: 'cors',
//         headers,
//         body: JSON.stringify({
//           query,
//         }),
//       })

//       const res = await fetch(req)

//       const json = await res.json()

//       if (!res.ok) {
//         console.error(json)
//         throw new Error(`HTTP error, status = ${res.status}`)
//       }

//       if (json.error != null) {
//         throw new Error(`GraphQL error = ${json.error}`)
//       }

//       console.log(json)
//       setState({ loading: false, ...json })
//     }

//     fetchData()
//   }, [auth0.isAuthenticated])

//   return state
// }

const userProfileServerFetchOptions = auth0Token => optons => {
    // const url = 'https://app-f49757b3-f48d-4078-8e8c-47b27b8b9d6d.cleverapps.io/graphql'
    const url = 'http://localhost:8080/graphql'

    const headers = new Headers({
      Authorization: `Bearer ${auth0Token}`,
      ContentType: 'application/json',
    })

    Object.assign(options, {
      url,
      mode: 'cors',
      headers,
    })
}

const Home = ({
  auth0Token,
}) => {
  const classes = HomeStyles()

  // const { loading, data } = useUserProfile(`
  //   query {
  //     my {
  //       machines {
  //         id
  //         publicKey
  //         name
  //         slug
  //       }
  //     }
  //   }
  // `)

  const { loading, cacheValue = {} } = useGraphQL({
    fetchOptionsOverride: userProfileServerFetchOptions(auth0Token),
    operation: {
      query: `
        {
          my {
            machines {
              id
              publicKey
              name
              slug
            }
          }
        }
      `
    },
    loadOnMount: true,
  })

  const navActions = ({ buttonClass }) => (
    <>
      <Button
        className={buttonClass}
        component={React.forwardRef((props, ref) => (
          <Link
            to="/get-started"
            className={classes.manage}
            innerRef={ref}
            {...props}
          />
        ))}
      >
        Add Printer
      </Button>
      <NavigationAuthLink buttonClass={buttonClass} />
    </>
  )

  return (
    <React.Fragment>
      <StaticTopNavigation
        title={() => 'Teg'}
        actions={navActions}
      />
      <div className={classes.root}>
        <List>
          { !loading && Object.values(cacheValue.my.machines).map(machine => (
            <ListItem key={machine.slug}>
              <ListItemText primary={machine.name} />
              <ListItemSecondaryAction>
                <Button
                  className={classes.manage}
                  component={React.forwardRef((props, ref) => (
                    <Link
                      to={`/q/${machine.slug}/`}
                      className={classes.manage}
                      innerRef={ref}
                      {...props}
                    />
                  ))}
                >
                  Manage
                </Button>
                <PrintButton href={`/print/?q=${machine.slug}`} />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </div>
    </React.Fragment>
  )
}

export default WithAuth0Token(Home)
