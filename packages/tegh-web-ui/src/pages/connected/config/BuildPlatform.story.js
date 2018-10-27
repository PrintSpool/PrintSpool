import React from 'react'
import { storiesOf } from '@storybook/react'
import { Component as BuildPlatformConfigPage } from './BuildPlatform.page'
import config from './config.mock'

const baselineProps = {
  config,
}

storiesOf('Config/BuildPlatform', module)
  .add('default', () => (
    <BuildPlatformConfigPage
      {...baselineProps}
    />
  ))
