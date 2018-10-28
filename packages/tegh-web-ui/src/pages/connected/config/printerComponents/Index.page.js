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

import FormDialog from '../components/FormDialog'
import BuildPlatformForm from './BuildPlatformForm.page'
import ControllerForm from './ControllerForm.page'
import FanForm from './FanForm.page'
import ToolheadForm from './ToolheadForm.page'

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


const componentsOfType = (config, ofType) => (
  config.components
    .filter(component => component.type === ofType)
)

const CATEGORIES = [
  {
    type: 'CONTROLLER',
    heading: 'Controllers',
    slug: 'controllers',
    dataPropName: 'controller',
    Icon: Usb,
    Page: ControllerForm,
  },
  {
    type: 'TOOLHEAD',
    heading: 'Toolheads',
    slug: 'toolheads',
    dataPropName: 'toolhead',
    Icon: Waves,
    Page: ToolheadForm,
  },
  {
    type: 'BUILD_PLATFORM',
    heading: 'Build Platform',
    slug: 'build-platforms',
    dataPropName: 'buildPlatform',
    Icon: VideoLabel,
    Page: BuildPlatformForm,
  },
  {
    type: 'FAN',
    heading: 'Fans',
    slug: 'fans',
    dataPropName: 'fan',
    Icon: Toys,
    Page: FanForm,
  },
]

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

const ComponentsConfigIndex = ({
  classes,
  config,
  updateSubConfig,
  match: {
    params,
  },
}) => (
  <main>
    {
      CATEGORIES.map(category => (
        <FormDialog
          key={category.slug}
          form={`${category.slug}/${params.componentID}`}
          open={params.componentTypeSlug === category.slug}
          onSubmit={updateSubConfig}
          Page={category.Page}
          data={config.components.find(c => c.id === params.componentID)}
        />
      ))
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
        CATEGORIES.map(({
          type,
          heading,
          slug,
          Icon,
        }) => (
          <div key={type}>
            <ListSubheader>
              {heading}
            </ListSubheader>
            {
              componentsOfType(config, type).map(component => (
                <ListItem
                  button
                  divider
                  key={component.id}
                  component={props => (
                    <Link to={`${slug}/${component.id}/`} {...props} />
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
