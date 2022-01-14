import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { gql } from '@apollo/client'

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
import Settings from '@mui/icons-material/Settings'

import HostStyles from './Host.style'

import StaticTopNavigation from '../../common/topNavigation/StaticTopNavigation'
import useLiveSubscription from '../_hooks/useLiveSubscription'
import Loading from '../../common/Loading'
import useSignallingGraphQL from '../../common/auth/useSignallingGraphQL'

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
  const { useQuery } = useSignallingGraphQL()

  const signallingRes: any = useQuery({
    query: `
      query($hostID: ID) {
        my {
          hosts(hostID: $hostID) {
            id
            orgName
          }
        }
      }
    `,
    variables: { hostID },
  })

  const { loading, data, error } = useLiveSubscription(HOST_QUERY, {
    fetchPolicy: 'network-only',
  })

  if (signallingRes.error) {
    throw signallingRes.error
  }

  if (error) {
    throw new Error(JSON.stringify(error, null, 2))
  }

  if (loading || signallingRes.loading) {
    return <Loading fullScreen />
  }

  const { machines } = data
  const { orgName } = signallingRes.data.my.hosts[0]

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
          {orgName || `Unnamed Organization (ID: ${hostID.slice(0, 8)}...)`}
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
                      to={`/${hostID}/add-printer`}
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
                        to={`/${hostID}/${machine.id}/`}
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
              component={React.forwardRef((props, ref) => (
                <Link
                  to={`/${hostID}/add-printer`}
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
