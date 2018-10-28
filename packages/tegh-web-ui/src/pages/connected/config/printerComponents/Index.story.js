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
    '/controllers/:id': linkTo('Config/Components/Controller', 'index'),
    '/toolheads/:id': linkTo('Config/Components/Toolhead', 'index'),
    '/build-platforms/:id': linkTo('Config/Components/BuildPlatform', 'index'),
    '/fans/:id': linkTo('Config/Components/Fan', 'index'),
  }))
  .add('index', () => (
    <ComponentsConfigPage
      {...baselineProps}
    />
  ))
