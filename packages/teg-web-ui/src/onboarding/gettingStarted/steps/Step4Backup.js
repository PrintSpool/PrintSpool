import React, { useContext, useEffect, useMemo } from 'react'
import { useGraphQL } from 'graphql-react'

import {
  Button,
  Typography,
} from '@material-ui/core'

import { getID } from '../../../UserDataProvider'
import userProfileServerFetchOptions from '../../../common/userProfileServer/fetchOptions'
import WithAuth0Token from '../../../common/auth/WithAuth0Token'

import Loading from '../../../common/Loading'

import Step4BackupStyles from './Step4BackupStyles'

import ButtonsFooter from '../ButtonsFooter'

const Step4Backup = ({
  className,
  history,
  invite,
  data,
  auth0Token,
}) => {
  const classes = Step4BackupStyles()

  const { loading, cacheValue = {} } = useGraphQL({
    fetchOptionsOverride: userProfileServerFetchOptions(auth0Token),
    operation: {
      query: `
        mutation($input: CreateMachine!) {
          createMachine(input: $input) { id }
        }
      `,
      variables: {
        input:  {
          publicKey: invite.peerIdentityPublicKey,
          name: data.jobQueue.name,
          slug: getID(invite),
        }
      }
    },

    // Load the query whenever the component mounts. This is desirable for
    // queries to display content, but not for on demand situations like
    // pagination view more buttons or forms that submit mutations.
    loadOnMount: true,

    // Reload the query whenever a global cache reload is signaled.
    loadOnReload: true,

    // Reload the query whenever the global cache is reset. Resets immediately
    // delete the cache and are mostly only used when logging out the user.
    loadOnReset: true
  })

  if (loading) {
    return (
      <Loading />
    )
  }
  console.log(cacheValue)

  if (cacheValue.httpError || cacheValue.graphQLErrors) {
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

  return (
    <React.Fragment>
      <div className={className}>
        <div className={classes.root}>
          <Typography variant="h6" paragraph>
            Your 3D Printer is ready to use
          </Typography>
          { /* TODO: User / Printer Setup */ }
        </div>
      </div>
      <ButtonsFooter step={4} history={history} />
    </React.Fragment>
  )
}

export default WithAuth0Token(Step4Backup)
