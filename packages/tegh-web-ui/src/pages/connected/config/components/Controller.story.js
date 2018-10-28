import React from 'react'
import { storiesOf } from '@storybook/react'
import { Component as ControllerConfigPage } from './Controller.page'
import config from '../config.mock'

const baselineProps = {
  config,
}

storiesOf('Config/Components/Controller', module)
  .add('index', () => (
    <ControllerConfigPage
      {...baselineProps}
    />
  ))
