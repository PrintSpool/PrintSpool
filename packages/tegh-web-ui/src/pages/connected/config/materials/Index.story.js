import React from 'react'
import { storiesOf } from '@storybook/react'
import { Component as MaterialsConfigIndex } from './Index.page'
import config from '../config.mock'

const baselineProps = {
  config,
}

storiesOf('Config/MaterialsIndex', module)
  .add('default', () => (
    <MaterialsConfigIndex
      {...baselineProps}
    />
  ))
