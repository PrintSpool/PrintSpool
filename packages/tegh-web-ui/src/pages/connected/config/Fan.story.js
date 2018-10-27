import React from 'react'
import { storiesOf } from '@storybook/react'
import { Component as FanConfigPage } from './Fan.page'
import config from './config.mock'

const baselineProps = {
  config,
}

storiesOf('Config/Fan', module)
  .add('default', () => (
    <FanConfigPage
      {...baselineProps}
    />
  ))
