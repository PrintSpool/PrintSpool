import React from 'react'
import { storiesOf } from '@storybook/react'
import StoryRouter from 'storybook-react-router'
import { linkTo } from '@storybook/addon-links'

import { Component as MaterialsConfigIndex } from './Index.page'
import materials from '../materials.mock'

const baselineProps = {
  materials,
}

storiesOf('Config/Materials/Index', module)
  .addDecorator(StoryRouter({
    '/:org/:sku': linkTo('Config/Materials/Form', 'index'),
  }))
  .add('index', () => (
    <MaterialsConfigIndex
      {...baselineProps}
    />
  ))
