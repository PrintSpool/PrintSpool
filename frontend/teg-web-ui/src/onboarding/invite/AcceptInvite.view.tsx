import React from 'react'
import { Link } from 'react-router-dom'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

import Loading from '../../common/Loading'
import StaticTopNavigation from '../../common/topNavigation/StaticTopNavigation'

const AcceptInviteView = ({
  consumeInvite,
  isPending,
  isDone,
}) => {
  if (isPending) {
    return <Loading fullScreen />
  }

  return (
    <div
      style={{
        display: 'grid',
        height: '100vh',
        gridTemplateRows: 'min-content 1fr',
      }}
    >
      <StaticTopNavigation />
      <div style={{
        margin: 16,
        marginBottom: 64,
        justifySelf: 'center',
        alignSelf: 'center',
      }}>
        {isDone && (
          <>
            <Typography variant="h3" paragraph>
              Great! Now to print all the things!
            </Typography>
            <Button
              variant="contained"
              color="success"
              component={Link}
              to="/"
            >
              Done
            </Button>
          </>
        )}
        {!isDone && (
          <>
            <Typography variant="h3" paragraph>
              You've been invited to join a 3D printer network.
            </Typography>
            <Button
              variant="contained"
              color="success"
              onClick={consumeInvite}
            >
              Heck yes. Accept that Invite!
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default AcceptInviteView
