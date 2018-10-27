import React from 'react'
import { storiesOf } from '@storybook/react'
import { Component as MaterialConfigForm } from './Form.page'
import config from '../config.mock'

const baselineProps = {
  material: config.materials[0],
}

storiesOf('Config/MaterialsForm', module)
  .add('default', () => (
    <MaterialConfigForm
      {...baselineProps}
    />
  ))
