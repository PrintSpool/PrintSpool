import React from 'react'
import { compose } from 'recompose'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router'
import { SchemaForm } from 'react-schema-form'

import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@material-ui/core'
import {
  Print,
  DeviceHub,
  Style,
} from '@material-ui/icons'

import patchConfigMutation from './mutations/patchConfig'
import FormDialog from './components/FormDialog'
import PrinterConfigPage from './Printer.page'

const enhance = compose(
  withRouter,
  patchConfigMutation,
)

const ConfigPage = ({
  config,
  printerDialogOpen = false,
  updateSubConfig,
  teghCoreSchema = {
    schema: {
      "type": "object",
      "required": [
        "firstName",
        "lastName",
        "address",
        "city",
        "province",
        "postalCode",
        "country",
        "phone"
      ],
      "title": "Address",
      "properties": {
        "firstName": {
          "title": "First Name",
          "type": "string"
        },
        "lastName": {
          "title": "Last Name",
          "type": "string"
        },
        "apartmentSuiteNumber": {
          "title": "Apartment/Suite Number",
          "type": "string"
        },
        "address": {
          "title": "Address",
          "type": "string"
        },
        "city": {
          "title": "City",
          "type": "string",
          "description": "Please enter full city name"
        },
        "province": {
          "title": "Province",
          "type": "string",
          "enum": [
            "AB",
            "BC",
            "MB",
            "NB",
            "NF",
            "NS",
            "NT",
            "NU",
            "ON",
            "PE",
            "QC",
            "SK",
            "YK"
          ]
        },
        "postalCode": {
          "title": "Postal Code",
          "type": "string"
        },
        "country": {
          "title": "Country",
          "type": "string",
          "enum": [
            "Canada"
          ]
        },
        "phone": {
          "title": "Phone",
          "type": "string",
          "description": "Please include area code"
        }
      }
    },
    form: [
      '*',
    ],
  },
}) => (
  <main>
    <FormDialog
      title="3D Printer"

      open={printerDialogOpen}
      onSubmit={updateSubConfig}

      Page={SchemaForm}
      schema={teghCoreSchema.schema}
      form={teghCoreSchema.form}
      model={config.plugins.find(p => p.package === 'tegh-core')}
      onModelChange={(val, b) => console.log('change', val, b)}
    />
    <List component="nav">
      <ListItem
        button
        divider
        component={props => <Link to="printer/" {...props} />}
      >
        <ListItemIcon>
          <Print />
        </ListItemIcon>
        <ListItemText primary="3D Printer" />
      </ListItem>
      <ListItem
        button
        divider
        component={props => <Link to="components/" {...props} />}
      >
        <ListItemIcon>
          <DeviceHub />
        </ListItemIcon>
        <ListItemText primary="Components" />
      </ListItem>
      <ListItem
        button
        divider
        component={props => <Link to="materials/" {...props} />}
      >
        <ListItemIcon>
          <Style />
        </ListItemIcon>
        <ListItemText primary="Materials" />
      </ListItem>
    </List>
  </main>
)

export const Component = ConfigPage
export default enhance(ConfigPage)
