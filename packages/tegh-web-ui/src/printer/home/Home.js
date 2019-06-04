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

const Home = () => {
  const classes = HomeStyles()

  const { hosts } = useContext(UserDataContext)

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
            <ListItem key={host.id}>
              <ListItemText primary={host.name} />
              <ListItemSecondaryAction>
                <Button
                  className={classes.manage}
                  component={props => (
                    <Link
                      to={`/q/${host.id}/`}
                      className={classes.manage}
                      {...props}
                    />
                  )}
                >
                  Manage
                </Button>
                <PrintButton href={`/print/?q=${host.id}`}/>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </div>
    </React.Fragment>
  )
}

export default Home
