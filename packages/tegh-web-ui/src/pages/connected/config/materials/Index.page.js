import React from 'react'
import { compose, withProps } from 'recompose'
import { Link } from 'react-router-dom'
import {
  withStyles,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Button,
} from '@material-ui/core'
import {
  Style,
  Add,
} from '@material-ui/icons'

import gql from 'graphql-tag'

import withLiveData from '../../shared/higherOrderComponents/withLiveData'

import FormDialog, { FORM_DIALOG_FRAGMENT } from '../components/FormDialog'

const CONFIG_SUBSCRIPTION = gql`
  subscription ConfigSubscription {
    live {
      patch { op, path, from, value }
      query {
        materials {
          id
          shortSummary
        }
      }
    }
  }
`

const styles = theme => ({
  title: {
    paddingTop: theme.spacing.unit * 3,
  },
  addFab: {
    position: 'fixed',
    bottom: theme.spacing.unit * 4,
    right: theme.spacing.unit * 2,
  },
})

const enhance = compose(
  withProps(ownProps => ({
    subscription: CONFIG_SUBSCRIPTION,
    variables: {},
  })),
  withLiveData,
  withStyles(styles, { withTheme: true }),
  withProps(({ materials, match: { params } }) => ({
    materialID: params.sku && `${params.org}/${params.sku}`,
  }))
)

const MaterialsConfigIndex = ({
  classes,
  printerID,
  materials,
  materialID,
  updateSubConfig,
}) => (
  <main>
    {
      materialID != null && (
        <FormDialog
          title={materialID}
          open
          variables={{ materialID }}
          query={gql`
            query($materialID: ID) {
              materials(materialID: $materialID) {
                ...FormDialogFragment
              }
            }
            ${FORM_DIALOG_FRAGMENT}
          `}
        />
      )
    }
    <Tooltip title="Add Component" placement="left">
      <Button
        component="label"
        variant="fab"
        className={classes.addFab}
      >
        <Add />
      </Button>
    </Tooltip>
    <List>
      {
        materials.map(material => (
          <ListItem
            button
            divider
            key={material.id}
            component={props => <Link to={`${material.id}/`} {...props} />}
          >
            <ListItemIcon>
              <Style />
            </ListItemIcon>
            <ListItemText
              primary={material.id}
              secondary={material.shortSummary}
            />
          </ListItem>
        ))
      }
    </List>
  </main>
)

export const Component = withStyles(styles, { withTheme: true })(
  MaterialsConfigIndex,
)
export default enhance(MaterialsConfigIndex)
