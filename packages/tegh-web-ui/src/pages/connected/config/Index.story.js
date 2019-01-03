import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import StoryRouter from 'storybook-react-router'
import { linkTo } from '@storybook/addon-links'
import { withRouter } from 'react-router'
import { compose, withStateHandlers, withProps } from 'recompose'

import { Component as ConfigPageUnwrapped } from './Index.page'
import { Component as FormDialogUnwrapped } from './components/FormDialog.js'
import configRoot from '../../../../../../development.config'

const config = configRoot.printer

const teghCoreSchemaForm = {
  schema: {
    type: 'object',
    required: [
    ],
    title: 'Address',
    properties: {
      name: {
        title: 'Name',
        type: 'string',
      },
      modelID: {
        title: 'Make and model',
        type: 'string',
        enum: [
          'lulzbot/lulzbot-mini-1',
          'lulzbot/lulzbot-mini-2',
        ],
        enumNames: [
          'Lulzbot Mini 1',
          'Lulzbot Mini 2',
        ],
      },
    },
  },
  form: [
    'name',
    'modelID',
  ],
}

const ConfigPage = withRouter(ConfigPageUnwrapped)

const withMockClient = compose(
  withStateHandlers(
    props => ({ data: props.data }),
    {
      writeData: ({ data }) => changeset => ({
        data: {
          ...data,
          model: {
            ...data.model,
            ...(changeset.data.model || {}),
          },
        },
      }),
    },
  ),
  withProps(ownProps => ({ client: { writeData: ownProps.writeData } })),
)

const FormDialog = compose(
  withMockClient,
  withRouter,
)(FormDialogUnwrapped)

storiesOf('Config', module)
  .addDecorator(StoryRouter({
    '/': linkTo('Config', 'index'),
    '/printer/': linkTo('Config', 'printer dialog'),
    '/components/': linkTo('Config/Components', 'index'),
    '/materials/': linkTo('Config/Materials', 'index'),
  }))
  .add('index', () => (
    <ConfigPage
      config={config}
      updateSubConfig={action('updateSubConfig')}
    />
  ))
  .add('printer dialog', () => (
    <FormDialog
      title="3D Printer"
      open
      onSubmit={linkTo('Config', 'index')}
      data={{
        model: config.plugins.find(p => p.package === '@tegh/core'),
        schemaForm: teghCoreSchemaForm,
      }}
    />
  ))
