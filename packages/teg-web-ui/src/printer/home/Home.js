import React, {
  useCallback,
  useEffect,
} from 'react'
import { useAsync } from 'react-async'
import { Link } from 'react-router-dom'
import { useGraphQL } from 'graphql-react'

import Card from '@material-ui/core/Card'
// import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import Fab from '@material-ui/core/Fab'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'
// import Icon from '@material-ui/core/Icon'
import Tooltip from '@material-ui/core/Tooltip'
import ListSubheader from '@material-ui/core/ListSubheader'
// import Divider from '@material-ui/core/Divider'

import Add from '@material-ui/icons/Add'

import { useAuth } from '../../common/auth'

import HomeStyles from './HomeStyles'

import StaticTopNavigation from '../../common/topNavigation/StaticTopNavigation'

const Home = () => {
  const classes = HomeStyles()
  const { user, getFetchOptions } = useAuth()

  // Note: if ever this page requires polling this will need to be re-ran before each request
  // to update the firebase token
  const { data: fetchOptionsOverride, error: firebaseError } = useAsync({
    promiseFn: useCallback(async () => {
      return user ? await getFetchOptions() : null
    }, [user]),
    // promiseFn: useCallback(async () => "wat", []),
    suspense: true,
  })

  if (firebaseError) {
    throw firebaseError
  }

  const { loading, cacheValue = {}, load } = useGraphQL({
    fetchOptionsOverride,
    operation: {
      query: `
        {
          currentUser {
            picture
          }
          my {
            hosts {
              id
              slug
              machines {
                id
                name
                slug
              }
            }
          }
        }
      `,
    },
  })
  console.log({ loading, cacheValue })

  useEffect(() => {
    if (fetchOptionsOverride) {
      load()
    }
  }, [fetchOptionsOverride])

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

  const hosts = Object.values(cacheValue.data.my.hosts)

  return (
    <>
      <StaticTopNavigation avatar={avatar} />
      { hosts.length > 0 && (
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
            { hosts.map(host => (
              <div key={host.slug}>
                { hosts.length > 1 && (
                  <ListItem>
                    <ListSubheader disableGutters>
                      {'Server ID: '}
                      {`${host.slug.slice(0, 8)}..`}
                    </ListSubheader>
                  </ListItem>
                )}
                { host.machines.map(machine => (
                  <ListItem
                    key={machine.slug}
                    button
                    component={React.forwardRef((props, ref) => (
                      <Link
                        to={`/m/${host.slug}/${machine.slug}/`}
                        // className={classes.manage}
                        innerRef={ref}
                        {...props}
                      />
                    ))}
                  >
                    <ListItemText primary={machine.name} />
                  </ListItem>
                ))}
              </div>
            ))}
          </List>
        </Card>
      )}
      { hosts.length === 0 && (
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
