import React, { useState } from 'react'
import { useGraphQL } from 'graphql-react'

import {
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@material-ui/core'

import WithAuth0Token from '../../common/auth/WithAuth0Token'
import { useAuth0 } from '../../common/auth/auth0'

import userProfileServerFetchOptions from '../../common/userProfileServer/fetchOptions'
import StaticTopNavigation from '../../common/topNavigation/StaticTopNavigation'

const UserSettings = ({ auth0Token }) => {
  const { user } = useAuth0()
  const [deleteMachine, setDeleteMachine] = useState()

  const { loading, cacheValue = {}, load } = useGraphQL({
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

  const { load: executeDelete } = useGraphQL({
    fetchOptionsOverride: userProfileServerFetchOptions(auth0Token),
    operation: {
      variables: {
        machineID: deleteMachine && deleteMachine.id.toString(),
      },
      query: `
        mutation($machineID: String!) {
          removeMachine(machineId: $machineID)
        }
      `,
    },
  })


  const error = !loading && (
    cacheValue.fetchError || cacheValue.httpError || cacheValue.graphQLErrors
  )

  if (error) {
    return (
      <div>
        <Typography variant="h6" paragraph>
          Something went wrong. Here's what we know:
        </Typography>
        <pre>
          {JSON.stringify(cacheValue, null, 2)}
        </pre>
      </div>
    )
  }

  if (loading || cacheValue.data == null) {
    return <div />
  }

  const machines = Object.values(cacheValue.data.my.machines)

  return (
    <>
      <StaticTopNavigation
        title={() => 'Teg'}
      />
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
                onClick={() => setDeleteMachine(machine)}
              >
                Delete
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog
        open={deleteMachine != null}
        onClose={() => setDeleteMachine(null)}
        aria-labelledby="alert-dialog-description"
      >
        <DialogTitle>
          Delete
          {' '}
          {deleteMachine && deleteMachine.name}
          ?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {
              `Are you sure you want to remove ${deleteMachine && deleteMachine.name}?`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteMachine(null)}>
            Cancel
          </Button>
          <Button onClick={async () => {
            await executeDelete()
            await load()
            setDeleteMachine(null)
          }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default WithAuth0Token(UserSettings)
