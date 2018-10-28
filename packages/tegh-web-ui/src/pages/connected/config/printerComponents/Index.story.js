import React from 'react'
import { storiesOf } from '@storybook/react'
import StoryRouter from 'storybook-react-router'
import { linkTo } from '@storybook/addon-links'

import { Component as ComponentsConfigPage } from './Index.page'
import config from '../config.mock'

storiesOf('Config/Components', module)
  .addDecorator(StoryRouter({
    '/': linkTo('Config/Components', 'index'),
    '/controllers/:id': linkTo('Config/Components', 'controller dialog'),
    '/toolheads/:id': linkTo('Config/Components', 'toolhead dialog'),
    '/build-platforms/:id': linkTo('Config/Components', 'build platform dialog'),
    '/fans/:id': linkTo('Config/Components', 'fan dialog'),
  }))
  .add('index', () => (
    <ComponentsConfigPage
      config={config}
      match={{
        params: {},
      }}
    />
  ))
  .add('controller dialog', () => (
    <ComponentsConfigPage
      config={config}
      match={{
        params: {
          componentTypeSlug: 'controllers',
          componentID: config.components.find(c => c.type === 'CONTROLLER').id,
        },
      }}
    />
  ))
  .add('toolhead dialog', () => (
    <ComponentsConfigPage
      config={config}
      match={{
        params: {
          componentTypeSlug: 'toolheads',
          componentID: config.components.find(c => c.type === 'TOOLHEAD').id,
        },
      }}
    />
  ))
  .add('build platform dialog', () => (
    <ComponentsConfigPage
      config={config}
      match={{
        params: {
          componentTypeSlug: 'build-platforms',
          componentID: config.components.find(c => c.type === 'BUILD_PLATFORM').id,
        },
      }}
    />
  ))
  .add('fan dialog', () => (
    <ComponentsConfigPage
      config={config}
      match={{
        params: {
          componentTypeSlug: 'fans',
          componentID: config.components.find(c => c.type === 'FAN').id,
        },
      }}
    />
  ))
