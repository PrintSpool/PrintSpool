import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@material-ui/core'

import { UserDataContext } from '../../UserDataProvider'

import HomeStyles from './HomeStyles'

import StaticTopNavigation from '../../common/topNavigation/StaticTopNavigation'
import PrintButton from '../printButton/PrintButton'
import PrintDialog from '../printDialog/PrintDialog'

const Home = ({ history }) => {
  const classes = HomeStyles()

  const { hosts } = useContext(UserDataContext)
  const [printDialogState, setPrintDialogState] = useState()

  return (
    <React.Fragment>
      <StaticTopNavigation
        title={() => 'Tegh'}
        actions={({ buttonClass }) => (
          <Button
            className={buttonClass}
            component={props => (
              <Link
                to="/get-started"
                className={classes.manage}
                {...props}
              />
            )}
          >
            Add Printer
          </Button>
        )}
      />
      <div className={classes.root}>
        <List>
          { Object.values(hosts).map(host => (
            <ListItem key={host.invite.peerIdentityPublicKey}>
              <ListItemText primary={host.name} />
              <ListItemSecondaryAction>
                <Button
                  className={classes.manage}
                  component={props => (
                    <Link
                      to={`/${host.invite.peerIdentityPublicKey}/`}
                      className={classes.manage}
                      {...props}
                    />
                  )}
                >
                  Manage
                </Button>
                <PrintButton
                  onClick={files => setPrintDialogState({ files, host })}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </div>
      <PrintDialog
        state={printDialogState}
        history={history}
        open={printDialogState != null}
        onCancel={() => setPrintDialogState(null)}
      />
    </React.Fragment>
  )
}

export default Home
