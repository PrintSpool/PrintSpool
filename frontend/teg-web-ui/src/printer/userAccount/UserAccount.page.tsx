import React, {
  useState,
} from 'react'
import { useAsync } from 'react-async'

import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'

import useSignallingGraphQL from '../../common/auth/useSignallingGraphQL'
import LoadingOverlay from '../../common/LoadingOverlay'

import StaticTopNavigation from '../../common/topNavigation/StaticTopNavigation'
import Avatar from '@material-ui/core/Avatar'
import Paper from '@material-ui/core/Paper'

const DeleteDialog = ({
  host,
  onClose,
}) => {
  const { useMutation } = useSignallingGraphQL()

    // remove the host from the user profile server
    const mutation: any = useMutation({
      query: `
        mutation($hostID: String!) {
          removeHostFromUser(hostID: $hostID) {
            id
          }
        }
      `,
      variables: {
        hostID: host?.id.toString(),
      },
      onComplete: onClose,
    })

  if (mutation.error) {
    throw mutation.error
  }

  const orgName = host?.orgName || host?.slug

  return (
    <Dialog
      open
      onClose={onClose}
      aria-labelledby="alert-dialog-description"
    >
      <LoadingOverlay loading={mutation.loading || host == null}>
        <DialogTitle>
          {
            `Are you sure you want to leave ${orgName}? `
          }
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Once you leave you will need a new invite to rejoin the organization.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.execute()}
            color="secondary"
          >
            Leave
          </Button>
        </DialogActions>
      </LoadingOverlay>
    </Dialog>
  )
}

const UserAccountPage = () => {
  const { useQuery } = useSignallingGraphQL()

  const [deletionHost, setDeletionHost] = useState()

  const { loading, data, error, execute: reFetchQuery } = useQuery({
    query: `
      {
        currentUser {
          picture
          email
        }
        my {
          hosts(onlyOrgs: true) {
            id
            orgName
            slug
          }
        }
      }
    `,
  })

  if (error) {
    throw error
  }

  if (loading) {
    return <div />
  }

  const { currentUser } = data
  const { hosts } = data.my

  return (
    <>
      <StaticTopNavigation />

      <Paper style={{
        // marginLeft: 16,
        // marginRight: 16,
        maxWidth: 700,
        marginTop: 32,
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: 16,
      }}>
        <Typography variant="h1" style={{
          marginTop: 32,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
        }}>
          <img
            src={currentUser.picture}
            style={{
              float: 'left',
              marginRight: 24,
              width: 100,
              height: 100,
              borderRadius: 50,
            }}
          />
          {currentUser.email}
        </Typography>

        <Typography variant="h3" style={{ marginTop: 32, marginBottom: 0 }}>
          Organizations
        </Typography>
        <List>
          { hosts.length === 0 && (
            <Typography variant="body1" component="div">
              You do not belong to any organizations
            </Typography>
          )}
          { hosts.map(host => (
            <ListItem key={host.slug}>
              <ListItemText primary={host.orgName || host.slug} />
              <ListItemSecondaryAction>
                <Button
                  color="secondary"
                  variant="outlined"
                  onClick={() => setDeletionHost(host)}
                >
                  Leave
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {deletionHost && (
          <DeleteDialog
            host={deletionHost}
            onClose={async () => {
              await reFetchQuery()
              setDeletionHost(null)
            }}
          />
        )}
      </Paper>
    </>
  )
}

export default UserAccountPage
