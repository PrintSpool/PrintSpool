import React from 'react'
import { storiesOf } from '@storybook/react'
import StoryRouter from 'storybook-react-router'
import { linkTo } from '@storybook/addon-links'

import { Component as ComponentsConfigPage } from './Index.page'
import config from '../config.mock'

const baselineProps = {
  config,
}

storiesOf('Config/Components', module)
  .addDecorator(StoryRouter({
    '/controllers/:id': linkTo('Config/Components/Controller', 'default'),
    '/toolheads/:id': linkTo('Config/Components/Toolhead', 'default'),
    '/build-platforms/:id': linkTo('Config/Components/BuildPlatform', 'default'),
    '/fans/:id': linkTo('Config/Components/Fan', 'default'),
  }))
  .add('default', () => (
    <ComponentsConfigPage
      {...baselineProps}
    />
  ))
