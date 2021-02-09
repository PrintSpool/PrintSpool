import React from 'react'
import { compose, withProps } from 'recompose'
import { Link } from 'react-router-dom'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Tooltip from '@material-ui/core/Tooltip'
import Fab from '@material-ui/core/Fab'

import { makeStyles } from '@material-ui/core/styles'

import Style from '@material-ui/icons/Style'
import Add from '@material-ui/icons/Add'

import { gql } from '@apollo/client'

import withLiveData from '../../common/higherOrderComponents/withLiveData'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/UpdateDialog.page'
import CreateMaterialDialog from '../components/CreateMaterialDialog/Index'
import useDeleteConfig from '../components/useDeleteConfig'

const CONFIG_SUBSCRIPTION = gql`
  subscription ConfigSubscription {
    live {
      patch { op, path, from, value }
      query {
        hasPendingUpdates
        machines {
          id
          status
        }
        materials {
          id
          name
          shortSummary
        }
      }
    }
  }
`

// eslint-disable-next-line
const useStyles = makeStyles(theme => ({
  root: {
    overflowY: 'scroll',
  },
  title: {
    paddingTop: theme.spacing(3),
  },
  addFab: {
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(2),
  },
}))

const enhance = compose(
  withProps(() => ({
    subscription: CONFIG_SUBSCRIPTION,
    variables: {},
  })),
  withLiveData,
  withProps(({ match: { params } }) => ({
    materialID: params.materialID,
    verb: params.materialID === 'new' ? 'new' : params.verb,
  })),
)

const MaterialsConfigIndex = ({
  materials,
  materialID,
  verb,
  machines,
  hasPendingUpdates,
}) => {
  const classes = useStyles()

  useDeleteConfig({
    show: materialID != null && verb === 'delete',
    id: materialID,
    collection: 'MATERIAL',
    machineID: null,
    type: 'material',
    title: materialID,
  })

  return (
    <main className={classes.root}>
      {
        materialID != null && verb == null && (
          <UpdateDialog
            title={(materials.find(m => m.id === materialID) || {}).name}
            open
            deleteButton
            status={machines[0].status}
            hasPendingUpdates={hasPendingUpdates}
            collection="MATERIAL"
            variables={{ materialID }}
            query={gql`
              query($materialID: ID) {
                materials(materialID: $materialID) {
                  configForm {
                    ...UpdateDialogFragment
                  }
                }
              }
              ${UPDATE_DIALOG_FRAGMENT}
            `}
          />
        )
      }
      { verb === 'new' && (
        <CreateMaterialDialog open />
      )}
      <Tooltip title="Add Component" placement="left">
        <Fab
          disabled={hasPendingUpdates || machines[0].status === 'PRINTING'}
          component={React.forwardRef((props, ref) => (
            <Link
              to={verb === 'new' ? './' : 'new/'}
              innerRef={ref}
              style={{ textDecoration: 'none' }}
              {...props}
            />
          ))}
          className={classes.addFab}
        >
          <Add />
        </Fab>
      </Tooltip>
      <List>
        {
          materials.map(material => (
            <ListItem
              button
              divider
              key={material.id}
              component={React.forwardRef((props, ref) => (
                <Link to={`${material.id}/`} innerRef={ref} {...props} />
              ))}
            >
              <ListItemIcon>
                <Style />
              </ListItemIcon>
              <ListItemText
                primary={material.name}
                secondary={material.shortSummary}
              />
            </ListItem>
          ))
        }
      </List>
    </main>
  )
}

export default enhance(MaterialsConfigIndex)
