import React from 'react'
import { storiesOf } from '@storybook/react'
import { Component as PrinterConfigPage } from './Printer.page'
import config from '../../../../../../development.config'

const baselineProps = {
  config,
}

storiesOf('Config/Printer', module)
  .add('index', () => (
    <PrinterConfigPage
      {...baselineProps}
    />
  ))
