import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { useGraphQL } from 'graphql-react'

import {
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
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

  if (state.loading) {
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

const userProfileServerFetchOptions = auth0Token => options => {
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

    // Load the query whenever the component mounts. This is desirable for
    // queries to display content, but not for on demand situations like
    // pagination view more buttons or forms that submit mutations.
    loadOnMount: true,

    // Reload the query whenever a global cache reload is signaled.
    loadOnReload: true,

    // Reload the query whenever the global cache is reset. Resets immediately
    // delete the cache and are mostly only used when logging out the user.
    loadOnReset: true
  })
  console.log({ loading, cacheValue })

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
      <NavigationAuthLink className={buttonClass} />
    </>
  )

  if (loading || cacheValue.data == null) {
    return <div />
  }

  const machines = Object.values(cacheValue.data.my.machines)

  return (
    <React.Fragment>
      <StaticTopNavigation
        title={() => 'Teg'}
        actions={navActions}
      />
      <div className={classes.root}>
          <List>
            { machines.map(machine => (
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
          { machines.length === 0 && (
            <div className={classes.emptyListMessage}>
              <Typography variant="h6" style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
                It looks like you don't have any 3D printers setup yet.
              </Typography>
              <Button
                className={classes.addFirstPrinterButton}
                variant="contained"
                color="primary"
                component={React.forwardRef((props, ref) => (
                  <Link
                    to="/get-started"
                    innerRef={ref}
                    {...props}
                  />
                ))}
              >
                Add your first printer
              </Button>
            </div>
          )}
      </div>
    </React.Fragment>
  )
}

export default WithAuth0Token(Home)
