import React, { useState } from 'react'
import { useGraphQL, GraphQL } from 'graphql-react'
import { useApolloClient } from 'react-apollo-hooks'
import gql from 'graphql-tag'
import { useAsync } from 'react-async'

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
import LoadingOverlay from '../../common/LoadingOverlay'

import userProfileServerFetchOptions from '../../common/userProfileServer/fetchOptions'
import StaticTopNavigation from '../../common/topNavigation/StaticTopNavigation'
import TegApolloProvider from '../../TegApolloProvider'

const DeleteDialog = ({
  machine,
  onClose,
  auth0Token,
}) => {
  const apollo = useApolloClient()

  const deleteMachine = useAsync({
    deferFn: async () => {
      // remove the machine from the user profile server
      const graphql = new GraphQL()

      await graphql.operate({
        fetchOptionsOverride: userProfileServerFetchOptions(auth0Token),
        operation: {
          query: `
            mutation($machineID: String!) {
              removeMachine(machineId: $machineID)
            }
          `,
          variables: {
            machineID: machine && machine.id.toString(),
          },
        },
      })

      // remove the user from the machine
      await apollo.mutate({
        mutation: gql`
          mutation {
            deleteCurrentUser
          }
        `,
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

const UserSettings = ({ auth0Token }) => {
  const [deletionMachine, setDeletionMachine] = useState()

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

  const error = !loading && (
    cacheValue.fetchError || cacheValue.httpError || cacheValue.graphQLErrors
  )

  if (error) {
    throw new Error(JSON.stringify(error, null, 2))
  }

  if (loading || cacheValue.data == null) {
    return <div />
  }

  const machines = Object.values(cacheValue.data.my.machines)

  return (
    <TegApolloProvider slug={deletionMachine && deletionMachine.slug}>
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
    </TegApolloProvider>
  )
}

export default WithAuth0Token(UserSettings)
