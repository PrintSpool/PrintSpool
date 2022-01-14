import React, {
  useCallback,
  useEffect,
} from 'react'
import { useAsync } from 'react-async'
import { Link } from 'react-router-dom'

import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Fab from '@mui/material/Fab'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
// import Icon from '@mui/material/Icon'
import Tooltip from '@mui/material/Tooltip'
// import ListSubheader from '@mui/material/ListSubheader'
// import Divider from '@mui/material/Divider'

import Add from '@mui/icons-material/Add'

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

  const { hosts }: any = data.my

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
            Servers
            {/* Organizations */}
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
            It looks like you do not have a 3D printer network setup yet.
          </Typography>
          <Button
            className={classes.addFirstPrinterButton}
            variant="contained"
            component={React.forwardRef((props, ref) => (
              <Link
                to="/get-started"
                innerRef={ref}
                {...props}
              />
            ))}
          >
            Set up a Print Server
          </Button>
        </div>
      )}
    </>
  )
}

export default Home
