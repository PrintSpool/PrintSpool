import React from 'react'
import { storiesOf } from '@storybook/react'
import { Component as ToolheadConfigPage } from './Toolhead.page'
import config from '../config.mock'

storiesOf('Config/Components/Toolhead', module)
  .add('index', () => (
    <ToolheadConfigPage
      heater={config.machine.components.find(c => c.type === 'EXTRUDER')}
    />
  ))
