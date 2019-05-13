import React from 'react'
import { compose, withProps } from 'recompose'
import { Link } from 'react-router-dom'
import {
  withStyles,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Tooltip,
  Fab,
} from '@material-ui/core'
import {
  Usb,
  Toys,
  VideoLabel,
  Widgets,
  Waves,
  CompareArrows,
  Add,
} from '@material-ui/icons'

import gql from 'graphql-tag'

import withLiveData from '../../shared/higherOrderComponents/withLiveData'

import UpdateDialog, { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/Index'
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog'
import CreateComponentDialog from '../components/CreateComponentDialog/Index'

import transformComponentSchema from './transformComponentSchema'

const COMPONENTS_SUBSCRIPTION = gql`
  subscription ConfigSubscription($printerID: ID!) {
    live {
      patch { op, path, from, value }
      query {
        devices {
          id
          type
        }
        materials {
          id
          name
        }
        printers(printerID: $printerID) {
          id
          status
          fixedListComponentTypes
          components {
            id
            type
            name
          }
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
    zIndex: 10,
    bottom: theme.spacing.unit * 4,
    right: theme.spacing.unit * 2,
  },
})

const componentsOfType = (components, ofType) => (
  components.filter(component => component.type === ofType)
)

const CATEGORIES = [
  {
    type: 'CONTROLLER',
    heading: 'Controllers',
    Icon: Usb,
  },
  {
    type: 'AXIS',
    heading: 'Axes',
    Icon: CompareArrows,
  },
  {
    type: 'TOOLHEAD',
    heading: 'Toolheads',
    Icon: Waves,
  },
  {
    type: 'BUILD_PLATFORM',
    heading: 'Build Platform',
    Icon: VideoLabel,
  },
  {
    type: 'FAN',
    heading: 'Fans',
    Icon: Toys,
  },
]

const enhance = compose(
  withProps(ownProps => ({
    subscription: COMPONENTS_SUBSCRIPTION,
    variables: {
      printerID: ownProps.match.params.printerID,
    },
  })),
  withLiveData,
  withProps(({ printers, match }) => {
    const { componentID, printerID, verb } = match.params
    const { components, fixedListComponentTypes, status } = printers[0]

    return {
      selectedComponent: components.find(c => c.id === componentID),
      components,
      fixedListComponentTypes,
      status,
      printerID,
      componentID,
      verb,
    }
  }),
  withStyles(styles, { withTheme: true }),
)

const ComponentsConfigIndex = ({
  classes,
  printerID,
  components,
  fixedListComponentTypes,
  status,
  componentID,
  selectedComponent,
  devices,
  materials,
  verb,
}) => (
  <main>
    { componentID !== 'new' && selectedComponent != null && verb == null && (
      <UpdateDialog
        title={selectedComponent.name}
        open={selectedComponent != null}
        status={status}
        deleteButton={
          fixedListComponentTypes.includes(selectedComponent.type) === false
        }
        collection="COMPONENT"
        transformSchema={schema => transformComponentSchema({
          schema,
          materials,
          devices,
        })}
        variables={{ printerID, componentID: selectedComponent.id }}
        query={gql`
          query($printerID: ID!, $componentID: ID) {
            printers(printerID: $printerID) {
              components(componentID: $componentID) {
                configForm {
                  ...UpdateDialogFragment
                }
              }
            }
          }
          ${UPDATE_DIALOG_FRAGMENT}
        `}
      />
    )}
    { selectedComponent != null && verb === 'delete' && (
      <DeleteConfirmationDialog
        type={selectedComponent.type.toLowerCase()}
        title={selectedComponent.name}
        id={selectedComponent.id}
        collection="COMPONENT"
        printerID={printerID}
        open={selectedComponent != null}
      />
    )}
    <CreateComponentDialog
      printerID={printerID}
      open={componentID === 'new'}
      fixedListComponentTypes={fixedListComponentTypes}
      devices={devices}
      materials={materials}
    />
    <Tooltip title="Add Component" placement="left">
      <Link to="new/" style={{ textDecoration: 'none' }}>
        <Fab
          component="label"
          className={classes.addFab}
        >
          <Add />
        </Fab>
      </Link>
    </Tooltip>
    <List>
      {
        CATEGORIES.map(({
          type,
          heading,
          Icon,
        }) => (
          <div key={type}>
            <ListSubheader>
              {heading}
            </ListSubheader>
            {
              componentsOfType(components, type).map(component => (
                <ListItem
                  button
                  divider
                  key={component.id}
                  component={props => (
                    <Link to={`${component.id}/`} {...props} />
                  )}
                >

                  <ListItemIcon>
                    {
                      (
                        Icon && <Icon />
                      )
                      || <Widgets />
                    }
                  </ListItemIcon>
                  <ListItemText>
                    {component.name}
                  </ListItemText>
                </ListItem>
              ))
            }
            <Divider />
          </div>
        ))
      }
    </List>
  </main>
)

export const Component = withStyles(styles, { withTheme: true })(
  ComponentsConfigIndex,
)
export default enhance(ComponentsConfigIndex)
