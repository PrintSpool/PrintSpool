import React from 'react'
import { storiesOf } from '@storybook/react'
import { Component as ConfigPage } from './Index.page'

storiesOf('Config/Index', module)
  .add('default', () => (
    <ConfigPage />
  ))
