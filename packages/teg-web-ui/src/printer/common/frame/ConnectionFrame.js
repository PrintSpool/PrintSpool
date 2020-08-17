import React, { useState } from 'react'
import gql from 'graphql-tag'

import { LiveSubscription } from '../../../common/LiveSubscription'
import Loading from '../../../common/Loading'

import Drawer, { DrawerFragment } from './components/Drawer'
import StaticTopNavigation from '../../../common/topNavigation/StaticTopNavigation'

// import { UserDataContext } from '../../../UserDataProvider'
import EStopResetToggle from './components/EStopResetToggle'
import ActionBar from '../../../common/topNavigation/ActionBar'
import useStyles from './ConnectionFrame.styles'

const FRAME_SUBSCRIPTION = gql`
  subscription ConnectionFrameSubscription {
    live {
      patch { op, path, from, value }
      query {
        machines {
          name
          status
          error {
            code
            message
          }
        }
        ...DrawerFragment
      }
    }
  }

  # fragments
  ${DrawerFragment}
`

const ConnectionFrame = ({
  match,
  children,
}) => {
  const { hostID: machineSlug } = match.params

  const classes = useStyles()

  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <LiveSubscription
      subscription={FRAME_SUBSCRIPTION}
    >
      {
        ({ data, loading, error }) => {
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
                    machineSlug={machineSlug}
                    machines={data.machines}
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
      }
    </LiveSubscription>
  )
}

export default ConnectionFrame
