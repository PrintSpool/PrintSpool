import React, {
  useCallback,
  useState,
} from 'react'
import { useAsync } from 'react-async'
import { useGraphQL, GraphQL } from 'graphql-react'
// import { useApolloClient } from '@apollo/client'

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

import { useAuth } from '../../common/auth'
import LoadingOverlay from '../../common/LoadingOverlay'

import StaticTopNavigation from '../../common/topNavigation/StaticTopNavigation'

const DeleteDialog = ({
  machine,
  onClose,
}) => {
  const { user, getFetchOptions } = useAuth()

  // Note: if ever this page requires polling this will need to be re-ran before each request
  // to update the firebase token
  const { data: fetchOptionsOverride, error } = useAsync({
    promiseFn: useCallback(async () => {
      return user && await getFetchOptions()
    }, [user]),
    // promiseFn: useCallback(async () => "wat", []),
    suspense: true,
  })
  if (error) {
    throw error
  }

  const deleteMachine = useAsync({
    deferFn: async () => {
      // remove the machine from the user profile server
      const graphql = new GraphQL()

      await graphql.operate({
        fetchOptionsOverride,
        operation: {
          query: `
            mutation($hostID: String!) {
              removeHostFromUser(hostID: $hostID)
            }
          `,
          variables: {
            hostID: machine && machine.id.toString(),
          },
        },
      })

      await onClose()
    },
  })

  if (deleteMachine.error) {
    throw new Error(deleteMachine.error)
  }

  return (
    <Dialog
      open
      onClose={onClose}
      aria-labelledby="alert-dialog-description"
    >
      <LoadingOverlay loading={deleteMachine.isPending || machine == null}>
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
          <Button onClick={deleteMachine.run}>
            Delete
          </Button>
        </DialogActions>
      </LoadingOverlay>
    </Dialog>
  )
}

const UserAccount = ({ auth0Token }) => {
  const { user, getFetchOptions } = useAuth()

  const { data: fetchOptionsOverride, error: firebaseError } = useAsync({
    promiseFn: useCallback(async () => {
      return user ? await getFetchOptions() : null
    }, [user]),
    // promiseFn: useCallback(async () => "wat", []),
    suspense: true,
  })

  const [deletionMachine, setDeletionMachine] = useState()

  const { loading, cacheValue = {}, load } = useGraphQL({
    fetchOptionsOverride,
    operation: {
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

  const error = !loading && (
    cacheValue.fetchError || cacheValue.httpError || cacheValue.graphQLErrors
  )

  if (error) {
    throw new Error(JSON.stringify(error, null, 2))
  }

  if (loading || cacheValue.data == null) {
    return <div />
  }

  const machines = cacheValue.data.my.hosts.map(host => Object.values(host.machines)).flat()

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
          auth0Token={auth0Token}
          onClose={async () => {
            await load()
            setDeletionMachine(null)
          }}
        />
      )}
    </>
  )
}

export default UserAccount
