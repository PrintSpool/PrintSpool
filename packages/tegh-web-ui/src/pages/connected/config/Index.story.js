import React from 'react'
import { storiesOf } from '@storybook/react'
import StoryRouter from 'storybook-react-router'
import { linkTo } from '@storybook/addon-links'
import { withRouter } from 'react-router'

import { Component as ConfigPageUnwrapped } from './Index.page'
import config from './config.mock'

const ConfigPage = withRouter(ConfigPageUnwrapped)

storiesOf('Config', module)
  .addDecorator(StoryRouter({
    '/': linkTo('Config', 'index'),
    '/printer/': linkTo('Config', 'printer dialog'),
    '/components/': linkTo('Config/Components', 'index'),
    '/materials/': linkTo('Config/Materials/Index', 'index'),
  }))
  .add('index', () => (
    <ConfigPage
      config={config}
      printerDialog={{
        open: false,
      }}
    />
  ))
  .add('printer dialog', () => (
    <ConfigPage
      config={config}
      printerDialog={{
        open: true,
      }}
    />
  ))
