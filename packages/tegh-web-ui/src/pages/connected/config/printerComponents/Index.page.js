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
  Button,
} from '@material-ui/core'
import {
  Usb,
  Toys,
  VideoLabel,
  Widgets,
  Waves,
  Add,
} from '@material-ui/icons'

import gql from 'graphql-tag'

import withLiveData from '../../shared/higherOrderComponents/withLiveData'

import FormDialog, { FORM_DIALOG_FRAGMENT } from '../components/FormDialog'

const COMPONENTS_SUBSCRIPTION = gql`
  subscription ConfigSubscription($printerID: ID!) {
    live {
      patch { op, path, from, value }
      query {
        printerConfigs(printerID: $printerID) {
          id
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
  withProps(({ printerConfigs, match }) => {
    const { componentID, printerID } = match.params
    const { components } = printerConfigs[0]

    return {
      selectedComponent: components.find(c => c.id === componentID),
      components,
      printerID,
    }
  }),
  withStyles(styles, { withTheme: true }),
)

const ComponentsConfigIndex = ({
  classes,
  printerID,
  components,
  selectedComponent,
}) => (
  <main>
    { selectedComponent != null && (
      <FormDialog
        title={selectedComponent.name}
        open={selectedComponent != null}
        variables={{ printerID, componentID: selectedComponent.id }}
        query={gql`
          query($printerID: ID!, $componentID: ID) {
            printerConfigs(printerID: $printerID) {
              components(componentID: $componentID) {
                ...FormDialogFragment
              }
            }
          }
          ${FORM_DIALOG_FRAGMENT}
        `}
      />
    )}
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
