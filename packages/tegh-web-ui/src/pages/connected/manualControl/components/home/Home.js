import React from 'react'
import { compose, withProps } from 'recompose'
import {
  Card,
  CardContent,
  Button,
} from '@material-ui/core'

import withSpoolMacro from '../../../shared/higherOrderComponents/withSpoolMacro'

const enhance = compose(
  withSpoolMacro,
  withProps(({ spoolMacro, printer }) => ({
    doHome: (args) => {
      spoolMacro({
        printerID: printer.id,
        macro: 'home',
        args,
      })
    },
  })),
)

const Home = ({
  doHome,
}) => (
  <Card>
    <CardContent>
      <div style={{ textAlign: 'right' }}>
        <Button
          variant="contained"
          onClick={() => doHome({ all: true })}
        >
          Home
        </Button>
      </div>
    </CardContent>
  </Card>
)

export default enhance(Home)
