import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import StoryRouter from 'storybook-react-router'
import { linkTo } from '@storybook/addon-links'

import { Component as MaterialsConfigIndex } from './Index.page'
import materials from '../materials.mock'

const baselineProps = {
  materials,
}

storiesOf('Config/Materials', module)
  .addDecorator(StoryRouter({
    '/': linkTo('Config/Materials', 'index'),
    '/:org/:sku': linkTo('Config/Materials', 'material dialog'),
  }))
  .add('index', () => (
    <MaterialsConfigIndex
      materials={materials}
      updateSubConfig={action('updateSubConfig')}
      match={{
        params: {},
      }}
    />
  ))
  .add('material dialog', () => (
    <MaterialsConfigIndex
      materials={materials}
      updateSubConfig={action('updateSubConfig')}
      match={{
        params: {
          org: 'generic',
          sku: 'pla',
        },
      }}
    />
  ))
