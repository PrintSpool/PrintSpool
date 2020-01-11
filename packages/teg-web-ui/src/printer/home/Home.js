import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'

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

const useUserProfile = (query) => {
  const auth0 = useAuth0()
  const [state, setState] = useState({ loading: true })

  useEffect(() => {
    if (!auth0.isAuthenticated) return

    const fetchData = async () => {
      const token = auth0.getTokenSilently()

      const headers = new Headers()
      headers.append('Authorization', `Bearer ${token}`)

      const formData = new FormData()
      formData.append('query', query)

      const req = new Request('https://app-f49757b3-f48d-4078-8e8c-47b27b8b9d6d.cleverapps.io/graphql', {
        method: 'POST',
        mode: 'cors',
        headers,
        body: formData,
      })

      const res = await fetch(req)
      if (!res.ok) {
        throw new Error(`HTTP error, status = ${res.status}`)
      }
      
      const json = await res.json()

      if (json.error != null) {
        throw new Error(`GraphQL error = ${json.error}`)
      }

      setState({ loading: false, data: json })
    }

    fetchData()
  }, [auth0.isAuthenticated])

  return state
}

const Home = () => {
  const classes = HomeStyles()

  const { loading, data } = useUserProfile(`
    query {
      my {
        machines {
          id
          public_key
          name
          slug
        }
      }
    }
  `)

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
          { !loading && Object.values(data.my.machines).map(machine => (
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

export default Home
