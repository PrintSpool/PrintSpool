import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { gql } from '@apollo/client'

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
import Settings from '@material-ui/icons/Settings'

import HostStyles from './Host.style'

import StaticTopNavigation from '../../common/topNavigation/StaticTopNavigation'
import useLiveSubscription from '../_hooks/useLiveSubscription'
import Loading from '../../common/Loading'

const HOST_QUERY = gql`
  fragment QueryFragment on Query {
    serverName
    machines {
      id
      name
      status
    }
  }
`

const HostPage = () => {
  const classes = HostStyles()
  const { hostID } = useParams()

  const { loading, data, error } = useLiveSubscription(HOST_QUERY, {
    fetchPolicy: 'network-only',
  })

  if (error) {
    throw new Error(JSON.stringify(error, null, 2))
  }

  if (loading) {
    return <Loading fullScreen />
  }

  const { machines } = data

  return (
    <>
      <StaticTopNavigation />
      <div className={classes.root}>
        <Button
          startIcon={<Settings />}
          className={classes.settingsButton}
          variant="outlined"
          component={Link}
          to="settings"
        >
          Settings
        </Button>
        <Typography
          variant="h1"
          className={classes.title}
        >
          {data.serverName || `Unnamed Server (ID: ${hostID.slice(0, 8)}...)`}
        </Typography>
        { machines.length > 0 && (
          <Card className={classes.card} raised>
            <Typography
              variant="h6"
              component="h2"
              className={classes.header}
            >
              Printers
              <Tooltip title="Add 3D Printer" placement="left">
                <Fab
                  className={classes.addButton}
                  size="small"
                  component={React.forwardRef((props, ref) => (
                    <Link
                      to={`/m/${hostID}/add-printer`}
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
                <div key={machine.id}>
                  <ListItem
                    key={machine.id}
                    button
                    component={React.forwardRef((props, ref) => (
                      <Link
                        to={`/m/${hostID}/${machine.id}/`}
                        // className={classes.manage}
                        innerRef={ref}
                        {...props}
                      />
                    ))}
                  >
                    <ListItemText primary={machine.name} />
                    </ListItem>
                </div>
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
                  to={`/m/${hostID}/add-printer`}
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
    </>
  )
}

export default HostPage
