import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGraphQL } from 'graphql-react'

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Fab from '@material-ui/core/Fab'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import Tooltip from '@material-ui/core/Tooltip'
import ListSubheader from '@material-ui/core/ListSubheader'

import Add from '@material-ui/icons/Add'

import { useAuth } from '../../common/auth'

import HomeStyles from './HomeStyles'

import StaticTopNavigation from '../../common/topNavigation/StaticTopNavigation'

const Home = () => {
  const classes = HomeStyles()
  const { fetchOptions } = useAuth()

  const { loading, cacheValue = {} } = useGraphQL({
    fetchOptionsOverride: fetchOptions,
    operation: {
      query: `
        {
          currentUser {
            picture
          }
          my {
            machines {
              id
              publicKey
              name
              slug
            }
          }
        }
      `,
    },

    // Load the query whenever the component mounts. This is desirable for
    // queries to display content, but not for on demand situations like
    // pagination view more buttons or forms that submit mutations.
    loadOnMount: true,

    // Reload the query whenever a global cache reload is signaled.
    loadOnReload: true,

    // Reload the query whenever the global cache is reset. Resets immediately
    // delete the cache and are mostly only used when logging out the user.
    loadOnReset: true,
  })
  console.log({ loading, cacheValue })

  const error = !loading && (
    cacheValue.fetchError || cacheValue.httpError || cacheValue.graphQLErrors
  )

  const avatar = cacheValue.data && cacheValue.data.currentUser.picture

  useEffect(() => {
    if (avatar) {
      localStorage.setItem('avatar', avatar)
    }
  }, [avatar])

  if (error) {
    throw new Error(JSON.stringify(error, null, 2))
  }

  if (loading || cacheValue.data == null) {
    return <div />
  }

  const machines = Object.values(cacheValue.data.my.machines)

  return (
    <>
      <StaticTopNavigation avatar={avatar} />
      { machines.length > 0 && (
        <Card className={classes.card} raised>
          <Typography
            variant="h6"
            component="h2"
            className={classes.header}
          >
            3D Printers
            <Tooltip title="Add 3D Printer" placement="left">
              <Fab
                className={classes.addButton}
                size="small"
                component={React.forwardRef((props, ref) => (
                  <Link
                    to="/get-started"
                    innerRef={ref}
                    {...props}
                  />
                ))}
              >
                <Add />
                {/* Add a Printer */}
              </Fab>
            </Tooltip>
          </Typography>

          <List>
            { machines.map(machine => (
              <ListItem
                key={machine.slug}
                button
                component={React.forwardRef((props, ref) => (
                  <Link
                    to={`/q/${machine.slug}/`}
                    // className={classes.manage}
                    innerRef={ref}
                    {...props}
                  />
                ))}
              >
                <ListItemText primary={machine.name} />
              </ListItem>
            ))}
          </List>
        </Card>
      )}
      { machines.length === 0 && (
        <div className={classes.emptyListMessage}>
          <Typography variant="h6" style={{ color: 'rgba(0, 0, 0, 0.54)' }}>
            It looks like you do not have any 3D printers setup yet.
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
    </>
  )
}

export default Home
