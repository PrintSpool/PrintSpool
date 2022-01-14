import React from 'react'
import { Link } from 'react-router-dom'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import PersonIcon from '@mui/icons-material/Person'

import { gql } from '@apollo/client'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/UpdateDialog.page'
import useStyles from './Users.styles'

const UsersConfigView = ({
  userID,
  verb,
  users,
  user,
  hasPendingUpdates,
  update,
  updateMutation
}) => {
  const classes = useStyles()

  return (
    <main className={classes.root}>
      {
        userID != null && verb == null && (
          <UpdateDialog
            title={user.description}
            open
            deleteButton={!user.isLocalHTTPUser}
            status={'READY'}
            hasPendingUpdates={hasPendingUpdates}
            onSubmit={update}
            updateMutation={updateMutation}
            variables={{ userID }}
            query={gql`
              query($userID: ID) {
                users(input: { userID: $userID }) {
                  configForm {
                    ...ConfigFormFragment
                  }
                }
              }
              ${UPDATE_DIALOG_FRAGMENT}
            `}
          />
        )
      }
      <List>
        {
          users.map(user => (
            <ListItem
              button
              divider
              key={user.id}
              component={React.forwardRef((props, ref) => (
                <Link to={`${user.id}/`} innerRef={ref} {...props}>
                  <ListItemIcon>
                    <Avatar src={user.picture}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText>
                    {user.description}
                  </ListItemText>
                </Link>
              ))}
            />
          ))
        }
      </List>
    </main>
  )
}

export default UsersConfigView
