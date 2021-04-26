import React, { useState } from 'react'
import { gql } from '@apollo/client'

import Loading from '../../../common/Loading'

import Drawer from './components/Drawer'
import StaticTopNavigation from '../../../common/topNavigation/StaticTopNavigation'

// import { UserDataContext } from '../../../UserDataProvider'
import EStopResetToggle from './components/EStopResetToggle'
import ActionBar from '../../../common/topNavigation/ActionBar'
import useStyles from './ConnectionFrame.styles'
import useLiveSubscription from '../../_hooks/useLiveSubscription'

const FRAME_QUERY = gql`
  fragment QueryFragment on Query {
    machines(input: $input) {
      id
      name
      developerMode
      status
      error {
        code
        message
      }
    }
  }
`

const ConnectionFrame = ({
  match,
  children,
}) => {
  const { machineID } = match.params

  const classes = useStyles()

  const [mobileOpen, setMobileOpen] = useState(false)

  const { data, loading, error } = useLiveSubscription(FRAME_QUERY, {
    variablesDef: '($input: MachinesInput)',
    variables: {
      input: {
        machineID,
      },
    },
  })

  if (error) {
    throw error
  }

  return (
    <div className={classes.root}>
      { loading && (
        <Loading fullScreen />
      )}
      { !loading && (
        <StaticTopNavigation
          className={classes.topNavigation}
          onMenuButtonClick={() => setMobileOpen(true)}
        />
      )}

      {
        // connected && !loading && (
        !loading && (
          <Drawer
            match={match}
            machine={data.machines[0]}
            className={classes.drawer}
            mobileOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
          />
        )
      }
      <div className={classes.content}>
        { !loading && (
          <ActionBar
            actions={({ buttonClass }) => (
              <EStopResetToggle
                buttonClass={buttonClass}
                machine={data.machines[0]}
              />
            )}
          />
        )}
        {
          children
        }
      </div>
    </div>
  )
}

export default ConnectionFrame
