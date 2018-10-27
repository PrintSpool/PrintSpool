import React from 'react'
import { storiesOf } from '@storybook/react'
import { Component as ToolheadConfigPage } from './Toolhead.page'
import config from './config.mock'

storiesOf('Config/Toolhead', module)
  .add('default', () => (
    <ToolheadConfigPage
      heater={config.machine.components.find(c => c.type === 'EXTRUDER')}
    />
  ))
