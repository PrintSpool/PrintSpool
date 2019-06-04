import React from 'react'
import { storiesOf } from '@storybook/react'
import StoryRouter from 'storybook-react-router'
import { linkTo } from '@storybook/addon-links'

import { Component as ComponentsConfigPage } from './Index.page'
import configRoot from '../../../../../../development.config'

const { components } = configRoot.printer

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
      components={components}
    />
  ))
  .add('controller dialog', () => (
    <ComponentsConfigPage
      components={components}
      selectedComponent={components.find(c => c.type === 'CONTROLLER')}
    />
  ))
  .add('toolhead dialog', () => (
    <ComponentsConfigPage
      components={components}
      selectedComponent={components.find(c => c.type === 'TOOLHEAD')}
    />
  ))
  .add('build platform dialog', () => (
    <ComponentsConfigPage
      components={components}
      selectedComponent={components.find(c => c.type === 'BUILD_PLATFORM')}
    />
  ))
  .add('fan dialog', () => (
    <ComponentsConfigPage
      components={components}
      selectedComponent={components.find(c => c.type === 'FAN')}
    />
  ))
