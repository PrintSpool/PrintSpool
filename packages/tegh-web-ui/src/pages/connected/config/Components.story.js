import React from 'react'
import { storiesOf } from '@storybook/react'
import { Component as ComponentsConfigPage } from './Components.page'
import config from './config.mock'

const baselineProps = {
  config,
}

storiesOf('Config/Components', module)
  .add('default', () => (
    <ComponentsConfigPage
      {...baselineProps}
    />
  ))
