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

const DeleteDialog = ({
  machine,
  onClose,
}) => {
  const { useMutation } = useSignallingGraphQL()

    // remove the machine from the user profile server
    const deleteMachine = useMutation({
      query: `
        mutation($hostID: String!) {
          removeHostFromUser(hostID: $hostID)
        }
      `,
      variables: {
        hostID: machine && machine.id.toString(),
      },
      onComplete: onClose,
    })

  if (deleteMachine.error) {
    throw deleteMachine.error
  }

  return (
    <Dialog
      open
      onClose={onClose}
      aria-labelledby="alert-dialog-description"
    >
      <LoadingOverlay loading={deleteMachine.loading || machine == null}>
        <DialogTitle>
          Delete
          {' '}
          {machine && machine.name}
          ?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {
              `Are you sure you want to remove ${machine && machine.name}?`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={deleteMachine.execute}>
            Delete
          </Button>
        </DialogActions>
      </LoadingOverlay>
    </Dialog>
  )
}

const UserAccount = ({ auth0Token }) => {
  const { useQuery } = useSignallingGraphQL()

  const [deletionMachine, setDeletionMachine] = useState()

  const { loading, data, error, execute: reFetchQuery } = useQuery({
    query: `
      {
        my {
          hosts {
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

  if (error) {
    throw error
  }

  if (loading) {
    return <div />
  }

  const machines = data.my.hosts.map(host => Object.values(host.machines)).flat()

  return (
    <>
      <StaticTopNavigation />
      <Typography variant="h5" component="h1">
        Account Settings
      </Typography>
      <Divider />
      <Typography variant="subtitle2" component="h2">
        3D Printers
      </Typography>
      <List>
        { machines.length === 0 && (
          <Typography variant="h5" component="div">
            You do not have any 3D printers configured
          </Typography>
        )}
        { machines.map(machine => (
          <ListItem key={machine.slug}>
            <ListItemText primary={machine.name} />
            <ListItemSecondaryAction>
              <Button
                color="secondary"
                variant="outlined"
                onClick={() => setDeletionMachine(machine)}
              >
                Delete
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      {deletionMachine && (
        <DeleteDialog
          machine={deletionMachine}
          onClose={async () => {
            await reFetchQuery()
            setDeletionMachine(null)
          }}
        />
      )}
    </>
  )
}

export default UserAccount
