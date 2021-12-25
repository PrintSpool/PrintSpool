import React, {
  useCallback,
  useEffect,
} from 'react'
import { useAsync } from 'react-async'
import { Link } from 'react-router-dom'

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
// import ListSubheader from '@material-ui/core/ListSubheader'
// import Divider from '@material-ui/core/Divider'

import Add from '@material-ui/icons/Add'

import { useAuth } from '../../common/auth'

import HomeStyles from './Home.style'

import StaticTopNavigation from '../../common/topNavigation/StaticTopNavigation'
import useSignallingGraphQL from '../../common/auth/useSignallingGraphQL'

const Home = () => {
  const classes = HomeStyles()
  const { user, getFetchOptions } = useAuth()
  const { useQuery } = useSignallingGraphQL()

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

  const { loading, error, data }: any = useQuery({
    query: `
      {
        currentUser {
          picture
        }
        my {
          hosts(onlyOrgs: true) {
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
  })
  // console.log({ loading, data })

  const avatar = data?.currentUser.picture

  useEffect(() => {
    if (avatar) {
      localStorage.setItem('avatar', avatar)
    }
  }, [avatar])

  if (error) {
    throw error
  }

  if (loading) {
    return <div />
  }

  const hosts: any = Object.values(data.my.hosts)

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
            Organizations
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
                {/* { hosts.length > 1 && (
                  <ListItem component="div">
                    <ListSubheader disableGutters>
                      {'Server ID: '}
                      {`${host.slug.slice(0, 8)}..`}
                    </ListSubheader>
                  </ListItem>
                )} */}
                {/* { host.machines.map(machine => ( */}
                <ListItem
                  key={host.slug}
                  button
                  component={React.forwardRef((props, ref) => (
                    <Link
                      to={`/${host.slug}/`}
                      // className={classes.manage}
                      innerRef={ref}
                      {...props}
                    />
                  ))}
                >
                  <ListItemText primary={host.slug} />
                  </ListItem>
                {/* ))} */}
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
