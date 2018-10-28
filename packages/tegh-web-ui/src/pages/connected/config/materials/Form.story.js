import React from 'react'
import { storiesOf } from '@storybook/react'
import { Component as MaterialConfigForm } from './Form.page'
import materials from '../materials.mock'

const baselineProps = {
  material: materials[0],
}

storiesOf('Config/Materials/Form', module)
  .add('index', () => (
    <MaterialConfigForm
      {...baselineProps}
    />
  ))
