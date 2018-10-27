import React from 'react'
import { storiesOf } from '@storybook/react'
import StoryRouter from 'storybook-react-router'
import { linkTo } from '@storybook/addon-links'

import { Component as ConfigPage } from './Index.page'
import config from './config.mock'


storiesOf('Config/Index', module)
  .addDecorator(StoryRouter({
    '/printer/': linkTo('Config/Printer', 'default'),
    '/components/': linkTo('Config/Components', 'default'),
    '/materials/': linkTo('Config/Materials/Index', 'default'),
  }))
  .add('default', () => (
    <ConfigPage config={config} />
  ))
