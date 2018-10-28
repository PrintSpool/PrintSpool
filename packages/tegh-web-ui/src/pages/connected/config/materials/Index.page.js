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

import FormDialog from '../components/FormDialog'
import MaterialConfigForm from './Form.page'

const CONFIG_SUBSCRIPTION = gql`
  subscription ConfigSubscription($printerID: ID!) {
    live {
      patch { op, path, from, value }
      query {
        printers {
          id
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
  withStyles(styles, { withTheme: true }),
  withProps(ownProps => ({
    subscription: CONFIG_SUBSCRIPTION,
    variables: {
      printerID: ownProps.match.params.printerID,
    },
  })),
  withLiveData,
  withProps(({ singularPrinter }) => ({
    printer: singularPrinter[0],
  })),
)

const MaterialsConfigIndex = ({
  classes,
  materials,
  match: {
    params,
  },
  updateSubConfig,
}) => (
  <main>
    <FormDialog
      form={`materials/${params.org}/${params.sku}`}
      Page={MaterialConfigForm}
      open={params.sku != null}
      onSubmit={updateSubConfig}
      data={
        materials.find(material => (
          material.id === `${params.org}/${params.sku}`
        ))
      }
    />
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
              secondary={`${material.targetExtruderTemperature}°`}
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
